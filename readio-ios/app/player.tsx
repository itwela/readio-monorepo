import LotusImageWithLoader from "@/components/LotusImageWithLoader"
import { DismissModalSymbol } from "@/components/LotusModals/DismissModalSymbol"
import { MovingText } from "@/components/MovingText"
import { PlayerControls, PlayPauseButton } from "@/components/ReadioPlayerControls"
import { PlayerProgressBar } from "@/components/ReadioPlayerProgressBar"
import { PlayerRepeatToggle } from "@/components/ReadioPlayerRepeatToggle"
import { PlayerVolumeBar } from "@/components/ReadioPlayerVolumeBar"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets"
import { unknownTrackImageUri } from "@/constants/images"
import { colors, fontSize } from "@/constants/tokens"
import { generateTracksListId } from '@/helpers/misc'
import sql from "@/helpers/neonClient"
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider"
import { useLotusUser } from "@/helpers/providers/lotusUserContext"
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext"
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack"
import { usePlayerBackground } from "@/hooks/usePlayerBackground"
import { useQueue } from '@/store/queue'
import { defaultStyles, utilsStyles } from "@/styles"
import { LotusArticle, RootNavigationProp } from '@/types/type'
import { FontAwesome } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import React, { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Pressable, SafeAreaView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import ReactNativeBlobUtil from 'react-native-blob-util'
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import TrackPlayer, { RepeatMode, Track, useActiveTrack } from 'react-native-track-player'


export default function Player() {

    const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
    const activeTrackFromHook = useActiveTrack()
    const activeTrack = activeTrackFromHook || lastActiveTrack
    const { top, bottom } = useSafeAreaInsets()
    const [isFavorite, setIsFavorite] = useState(false)
    const [isUpvoted, setIsUpvoted] = useState(false)
    const { imageColors } = usePlayerBackground(activeTrack?.image ?? unknownTrackImageUri)
    const { user } = useLotusUser()
    const { 
        playerMode, 
        setPlayerMode,
        activeStationName, 
        setActiveStationName,
        setFeatureArticleName,
        setFeatureArticleImage 
    } = useLotusUtils()
    const [sToast, setSToast] = useState(false)
    const [toastMessege, setToastMessege] = useState("")
    const navigation = useNavigation<RootNavigationProp>();
    const { setUser } = useLotusUser()
    const { activeQueueId } = useQueue()
    const [isDownloading, setIsDownloading] = useState(false)
    const queueOffset = useRef(0)
    const { lightFeedback, mediumFeedback, successFeedback, errorFeedback } = useLotusHaptic()

    const [trackIsFeatured, setTrackIsFeatured] = useState(false)

    const showToast = (message: string) => {
        setSToast(true)
        setToastMessege(message)
        // setInterval(() => {
        //   setSToast(false)
        // }, 5000)
    };

    const hideToast = () => {
        setSToast(false)
        setToastMessege('')
    }

    const getUserInfo = async () => {
        const userInfo = await sql`SELECT * FROM users WHERE jwt = ${user?.jwt}`
        setUser?.(userInfo[0]);
        // console.log("userInfo: ", userInfo[0]);
    };

    const toggleFavorite = async () => {
        let wantsToFavorite = null

        // console.log("toggleFavorite starting")

        // Check if the user has already upvoted
        const existingFavorite = await sql`
            SELECT * FROM favorites 
            WHERE readio_id = ${activeTrack?.id} AND user_id = ${user?.user_db_id};
        `;

        // console.log("toggleFavorite looked for existing favorite")

        if (existingFavorite.length > 0) {
            wantsToFavorite = false;
            // Remove the upvote since unfavoriting
            await sql`
                DELETE FROM favorites
                WHERE readio_id = ${activeTrack?.id} AND user_id = ${user?.user_db_id};
            `;

            setIsFavorite(!isFavorite)
            // console.log("toggleFavorite decreased favorite")
        }

        if (existingFavorite.length === 0) {
            wantsToFavorite = true
            // Add an favorite since favoriting
            await sql`
                INSERT INTO favorites (readio_id, user_id)
                VALUES (${activeTrack?.id}, ${user?.user_db_id});
            `;

            setIsFavorite(!isFavorite)
            // console.log("toggleFavorite increased favorite")
        }

        getUserInfo()
        // console.log("toggleFavorite ran")

        successFeedback();

    };

    const toggleUpvote = async () => {

        let wantsToUpvote = null

        // console.log("toggleUpvote starting")

        // Check if the user has already upvoted
        const existingUpvote = await sql`
            SELECT * FROM upvotes 
            WHERE readio_id = ${activeTrack?.id} AND user_id = ${user?.user_db_id};
        `;

        // console.log("toggleUpvote looked for existing upvotes")

        if (existingUpvote.length > 0) {
            wantsToUpvote = false;
            // Remove the upvote since unUpvoting
            await sql`
                DELETE FROM upvotes
                WHERE readio_id = ${activeTrack?.id} AND user_id = ${user?.user_db_id};
            `;

            // Decrement the upvote count in `readios`
            await sql`
                UPDATE readios
                SET upvotes = upvotes - 1
                WHERE id = ${activeTrack?.id};
            `;

            await sql`
                UPDATE users
                SET upvotes = upvotes - 1
                WHERE user_db_id = ${user?.user_db_id};
            `;

            setIsUpvoted(!isUpvoted)
            // console.log("toggleFavorite decreased upvotes")
        }

        if (existingUpvote.length === 0) {
            wantsToUpvote = true
            // Add an upvote since upvoting
            await sql`
                INSERT INTO upvotes (readio_id, user_id)
                VALUES (${activeTrack?.id}, ${user?.user_db_id});
            `;

            // Increment the upvote count in `readios`
            await sql`
                UPDATE readios
                SET upvotes = upvotes + 1
                WHERE id = ${activeTrack?.id};
            `;

            await sql`
                UPDATE users
                SET upvotes = upvotes + 1
                WHERE user_db_id = ${user?.user_db_id};
            `;

            setIsUpvoted(!isUpvoted)
            // console.log("toggleFavorite increased upvotes")
        }

        getUserInfo()
        // console.log("toggleUpvote ran")

        successFeedback();

    };

    // Consolidated effect for track status checks
    useEffect(() => {
        if (!activeTrack || !user?.user_db_id) {
            setIsFavorite(false);
            setIsUpvoted(false);
            setTrackIsFeatured(false);
            return;
        }

        const fetchTrackStatus = async () => {
            try {
                const [upvoteResult, favoriteResult, featuredResult] = await Promise.all([
                    sql`SELECT 1 FROM upvotes WHERE readio_id = ${activeTrack.id} AND user_id = ${user.user_db_id} LIMIT 1`,
                    sql`SELECT 1 FROM favorites WHERE readio_id = ${activeTrack.id} AND user_id = ${user.user_db_id} LIMIT 1`,
                    sql`SELECT featured FROM readios WHERE id = ${activeTrack.id} LIMIT 1`
                ]);

                setIsUpvoted(upvoteResult.length > 0);
                setIsFavorite(favoriteResult.length > 0);
                setTrackIsFeatured(featuredResult.length > 0 && featuredResult[0].featured);
            } catch (error) {
                console.error("Error fetching track status:", error);
                errorFeedback();
            }
        };

        fetchTrackStatus();
    }, [activeTrack?.id, user?.user_db_id]);

    if (!activeTrack) {
        return (
            <SafeAreaView style={[defaultStyles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator color={colors.icon} />
                <Text allowFontScaling={false}>Loading track...</Text>
            </SafeAreaView>
        );
    }


    const handleDownload = async () => {
        mediumFeedback();
        setIsDownloading(true);
        // console.log('[handleDownload Player] Attempting to download track...');

        try {
            const track = activeTrack;
            // console.log('[handleDownload Player] Track data:', JSON.stringify(track, null, 2));

            if (track?.url) {
                // console.log('[handleDownload Player] Track URL:', track.url);

                // Create a safe filename from the title
                let safeTitle = track.title?.replace(/[^a-zA-Z0-9\s]/gi, '_').replace(/\s+/g, '_') || 'DownloadedTrack';
                if (safeTitle.length > 50) { // Keep filename reasonably short
                  safeTitle = safeTitle.substring(0, 50);
                }
                // console.log('[handleDownload Player] Safe title for file:', safeTitle);

                const downloadDest = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeTitle}.mp3`;
                // console.log('[handleDownload Player] Download destination:', downloadDest);

                // First download the file with custom filename
                const response = await ReactNativeBlobUtil.config({
                    fileCache: true,
                    path: downloadDest,
                    // appendExt: 'mp3', // 'path' option usually makes appendExt redundant if extension is in path
                }).fetch('GET', track.url);

                // console.log('[handleDownload Player] Download response status:', response.info().status);
                const filePath = response.path();
                // console.log('[handleDownload Player] File downloaded to:', filePath);

                if (!filePath) {
                  console.error('[handleDownload Player] Error: File path is undefined after download.');
                  errorFeedback();
                  throw new Error('File path is undefined after download.');
                }

                const shareOptions = {
                    title: track.title || 'Shared Track',
                    message: track.title || "Check out this track!",
                    url: `file://${filePath}`, // Make sure to include file:// prefix
                    saveToFiles: true,
                };
                // console.log('[handleDownload Player] Share options:', JSON.stringify(shareOptions, null, 2));

                try {
                    // console.log('[handleDownload Player] Attempting to share...');
                    // Show share dialog with save option
                    await Share.share(shareOptions);
                    // console.log('[handleDownload Player] Share successful.');
                    successFeedback();
                } catch (error) {
                    // Error during sharing (e.g., user cancelled)
                    console.warn('[handleDownload Player] Error or cancellation during sharing track:', error);
                    errorFeedback();
                }

                // Clean up the temporary file
                // console.log('[handleDownload Player] Flushing temporary file...');
                await response.flush();
                // console.log('[handleDownload Player] Temporary file flushed.');

            } else {
                console.warn('[handleDownload Player] Track URL is missing. Cannot download.');
                errorFeedback();
            }
        } catch (error) {
            console.error('[handleDownload Player] Error during download process:', error);
            errorFeedback(); // General error feedback
        } finally {
            setIsDownloading(false);
            // console.log('[handleDownload Player] Download process finished.');
        }

     }
    const updateFeatured = async () => {

        // console.log("activeTrack?.featured: ", activeTrack?.featured)
        // console.log("activeTrack?.id: ", activeTrack?.id)

        const setOldArticleToFalse = await sql`
		  UPDATE readios
		  SET featured = ${false}
		  WHERE featured = ${true}
		  RETURNING *;
		`;

        const updateNewResponse = await sql`
		  UPDATE readios
		  SET featured = ${!activeTrack?.featured}
		  WHERE id = ${activeTrack?.id}
		  RETURNING *;
		`;


        // console.log("new featured: ", activeTrack?.featured)
        // console.log("new id: ", activeTrack?.id)


        setFeatureArticleImage?.(updateNewResponse[0].image_urls)
        setFeatureArticleName?.(updateNewResponse[0].title)

        // console.log("new featured: ", updateNewResponse[0].featured)
        // console.log("new id: ", updateNewResponse[0].id)

        setTrackIsFeatured(updateNewResponse[0].featured)

        // console.log('updated')

        router.push('/(tabs)/(home)/home')

        successFeedback();

        return updateNewResponse[0].featured
    }

    return (
        <>
            <LinearGradient style={{ flex: 1 }} colors={imageColors ? [imageColors.background, imageColors.primary] : [colors.readioWhite, colors.readioWhite]}>

                <View style={styles.overlayContainer}>

                    <SafeAreaView style={{ width: '100%', height: '100%' }}>
                        <DismissModalSymbol color={colors.readioBlack}/>

                        <View style={{ marginTop: top - 20, marginBottom: bottom }}>
                            <View style={styles.artworkImageContainer}>

                                {activeTrack?.image === "" && (
                                    <LotusImageWithLoader
                                        source={ImageAssets.unknownArticle} resizeMode="cover" style={styles.artworkImage} />
                                )}

                                {activeTrack?.artwork != "" && (
                                    <>
                                        <LotusImageWithLoader
                                            useAnimated
                                            source={ImageAssets.filter} style={[styles.artworkImage, { zIndex: 1, opacity: 0.2, position: 'absolute' }]} resizeMode='cover'
                                            />
                                        <LotusImageWithLoader
                                            useAnimated
                                            source={{
                                                uri: activeTrack?.artwork ?? getLocalImageUri('unknownArticle'),
                                            }} resizeMode="cover" style={styles.artworkImage} 
                                        />
                                    </>
                                )}

                            </View>

                            {/* <Pressable
                            onPress={updateFeatured}
                                style={trackIsFeatured ? styles.adminFeaturedButton : styles.adminNotFeatured}
                            >
                                <LotusImageWithLoader
                                    useSpinnerLoader
                                    loaderSize="small"
                                    loaderColor={colors.readioBlack}
                                    style={{ width: 20, height: 20 }}
                                    source={ImageAssets.blackLogo}
                                    resizeMode="contain"
                                />
                                <Text allowFontScaling={false} style={trackIsFeatured ? styles.adminButtonText : styles.adminNotFeaturedText}>{trackIsFeatured ? "Featured" : "Feature on Homepage?"}</Text>
                            </Pressable> */}

                        </View>


                        <View style={styles.playerControlsContainer}>
                            <View style={styles.trackInfoContainer}>

                                <Animated.View entering={FadeInDown.duration(618)} style={styles.trackDetailsContainerColunn}>

                                    {/* REVIEW */}
                                    <View style={styles.actionButtonsContainer}>
                                        <View style={{ display: 'flex', gap: 10, flexDirection: 'row' }}>
                                            <TouchableOpacity
                                                onPress={toggleUpvote}
                                                activeOpacity={0.7}
                                                style={styles.controlButton}
                                            >
                                                <IconSymbol
                                                    name={isUpvoted ? 'hand.thumbsup.fill' : 'hand.thumbsup'}
                                                    size={24}
                                                    color={colors.readioOrange}
                                                    style={{ opacity: 0.9 }}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={playerMode === "radio" ? toggleUpvote : toggleFavorite}
                                                activeOpacity={0.7}
                                                style={styles.controlButton}
                                            >
                                                <FontAwesome
                                                    name={isFavorite ? 'heart' : 'heart-o'}
                                                    size={24}
                                                    color={colors.readioOrange}
                                                    style={{ opacity: 0.9 }}
                                                />
                                            </TouchableOpacity>


                                        </View>
                                        {user?.user_role === 'admin' && (
                                            <>
                                                <View style={{ display: 'flex', gap: 10, flexDirection: 'row' }}>


                                                    <TouchableOpacity
                                                        onPress={handleDownload}
                                                        activeOpacity={0.7}
                                                        style={styles.controlButton}
                                                    >
                                                        <FontAwesome
                                                            name={`${isDownloading ? 'spinner' : 'download'}`}
                                                            size={30}
                                                            style={{ opacity: 0.9 }}
                                                            color={colors.readioOrange}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        )}
                                    </View>

                                    <View style={styles.titleArtistContainer}>
                                        <MovingText text={activeTrack?.title ?? "Loading..."} animationThreshold={30} style={styles.trackTitle} />
                                        <Text allowFontScaling={false} numberOfLines={1} style={styles.trackArtistText}>
                                            {activeTrack?.artist ?? "Loading..."}
                                        </Text>
                                    </View>

                                    <PlayerProgressBar style={{}}></PlayerProgressBar>

                                    {playerMode === 'radio' && (
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                                            <PlayPauseButton iconSize={35} color={colors.readioBlack} />
                                        </View>
                                    )}

                                    {playerMode != 'radio' && (
                                        <PlayerControls style={{}}></PlayerControls>
                                    )}

                                    {/* REVIEW */}
                                    <PlayerVolumeBar style={{}} />

                                    {/* REVIEW */}
                                    <View style={utilsStyles.centeredRow}>

                                        <PlayerRepeatToggle size={30} style={[styles.controlButton, { marginBottom: 6 }]}></PlayerRepeatToggle>

                                    </View>

                                </Animated.View>


                            </View>

                        </View>

                    </SafeAreaView>

                </View>

            </LinearGradient>

        </>

    )

}



const styles = StyleSheet.create({
    adminFeaturedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.readioDustyWhite,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 24,
        borderColor: `${colors.readioOrange}60`,
    },
    adminNotFeatured: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.readioDustyWhite,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        justifyContent: 'center',
        width: '60%',
        alignSelf: 'center',
        marginTop: 24,
        borderColor: `${colors.readioBlack}60`,
    },
    adminButtonText: {
        color: colors.readioOrange,
        fontSize: 14,
        fontWeight: 'bold',
    },
    adminNotFeaturedText: {
        color: colors.readioBrown,
        fontSize: 14,
        fontWeight: 'bold',
        opacity: .6
    },
    controlButton: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        transform: [{ scale: 1 }]
    },
    playPauseButton: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        transform: [{ scale: 1 }]
    },
    skipButton: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        transform: [{ scale: 1 }],
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    overlayContainer: {
        paddingHorizontal: 16,
        backgroundColor: colors.readioWhite,
        height: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    playerControlsContainer: {
        flexGrow: 1,
        maxHeight: 'auto',
        marginHorizontal: 2,
        paddingVertical: 24,
        backgroundColor: colors.readioWhite,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    trackInfoContainer: {
        marginTop: 'auto',
        paddingHorizontal: 16,
    },
    trackDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    trackDetailsContainerColunn: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
        gap: 15,
    },
    titleArtistContainer: {
        // flex: 1,
        marginRight: 16,
        width: '100%',
        overflow: 'hidden',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    toast: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        zIndex: 10,
        backgroundColor: '#fff',
        maxWidth: '100%',
        height: 50,
        display: 'flex'
    },
    dismissPlayerSymbol: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1
    },
    artworkImageContainer: {
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.44,
        shadowRadius: 11.0,
        flexDirection: 'column',
        height: 300,
        justifyContent: 'center',
        width: 300,
        alignItems: 'center',
        gap: 20,
        alignSelf: 'center',
    },
    artworkImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        resizeMode: 'cover'
    },
    trackTitle: {
        ...defaultStyles.text,
        fontSize: 22,
        fontWeight: '700',
        color: colors.readioBlack,
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    trackArtistText: {
        ...defaultStyles.text,
        fontSize: fontSize.base,
        opacity: 0.8,
        maxWidth: '90%',
        color: colors.readioBlack,
    },
})
