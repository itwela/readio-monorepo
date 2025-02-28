import { View, StyleSheet, Text, SafeAreaView, ActivityIndicator, Animated as ReactNativeAnimated, Pressable, Share, TouchableOpacity, Image } from "react-native"
import { defaultStyles, utilsStyles } from "@/styles"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useActiveTrack } from "react-native-track-player"
import { colors, fontSize } from "@/constants/tokens"
import { filter, unknownTrackImageUri } from "@/constants/images"
import { MovingText } from "@/components/MovingText"
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import { PlayerProgressBar } from "@/components/ReadioPlayerProgressBar"
import { PlayerControls, PlayPauseButton } from "@/components/ReadioPlayerControls"
import { PlayerVolumeBar } from "@/components/ReadioPlayerVolumeBar"
import { PlayerRepeatToggle } from "@/components/ReadioPlayerRepeatToggle"
import { useEffect, useState, useRef } from "react"
import { fetchAPI } from '@/lib/fetch';
import { usePlayerBackground } from "@/hooks/usePlayerBackground"
import { LinearGradient } from "expo-linear-gradient"
import { useLotusUser } from "@/helpers/providers/lotusUserContext"
import { retryWithBackoff } from '@/helpers/retryWithBackoff';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { s3 } from '@/helpers/s3Client';
import { Buffer } from 'buffer';
import { generateTracksListId } from '@/helpers/misc'
import { LotusArticle, Station } from '@/types/type';
import { useFetch } from "@/lib/fetch";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import TrackPlayer, { RepeatMode, Track } from 'react-native-track-player'
import { useQueue } from '@/store/queue'
import sql from "@/helpers/neonClient"
import { IconSymbol } from "@/components/ui/IconSymbol"
import React from "react"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { ViewProps } from "@/components/Themed"
import { getLocalImageUri } from "@/constants/imageAssets"
import { router } from "expo-router"
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext"


export default function Player() {

    const activeTrack = useActiveTrack()
    const { top, bottom } = useSafeAreaInsets()
    const [isFavorite, setIsFavorite] = useState(false)
    const [isUpvoted, setIsUpvoted] = useState(false)
    const { imageColors } = usePlayerBackground(activeTrack?.image ?? unknownTrackImageUri)
    const { user } = useLotusUser()
    const { playerMode, setPlayerMode } = useLotusUtils()
    const { activeStationName, setActiveStationName } = useLotusUtils()
    const [sToast, setSToast] = useState(false)
    const [toastMessege, setToastMessege] = useState("")
    const { selectedReadios, setSelectedReadios } = useLotusUtils()
    const { selectedLotusReadios, setSelectedLotusReadios, setFeatureArticleName, setFeatureArticleImage } = useLotusUtils()

    // const stations = await sql`
    //     SELECT stations.*
    //     FROM stations
    //     INNER JOIN station_clerks ON stations.id = station_clerks.station_id
    //     WHERE station_clerks.clerk_id = ${user?.id};
    // `;

    const navigation = useNavigation<RootNavigationProp>(); // use typed navigation  
    const { setUser } = useLotusUser()
    const [readios, setReadios] = useState<LotusArticle[]>([]);
    const [tracks, setTracks] = useState<any>();
    const { activeQueueId, setActiveQueueId } = useQueue()
    const [isDownloading, setIsDownloading] = useState(false)
    const queueOffset = useRef(0)

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

        console.log("toggleFavorite starting")

        // Check if the user has already upvoted
        const existingFavorite = await sql`
            SELECT * FROM favorites 
            WHERE readio_id = ${activeTrack?.id} AND user_id = ${user?.clerk_id};
        `;

        console.log("toggleFavorite looked for existing favorite")

        if (existingFavorite.length > 0) {
            wantsToFavorite = false;
            // Remove the upvote since unfavoriting
            await sql`
                DELETE FROM favorites
                WHERE readio_id = ${activeTrack?.id} AND user_id = ${user?.clerk_id};
            `;

            setIsFavorite(!isFavorite)
            console.log("toggleFavorite decreased favorite")
        }

        if (existingFavorite.length === 0) {
            wantsToFavorite = true
            // Add an favorite since favoriting
            await sql`
                INSERT INTO favorites (readio_id, user_id)
                VALUES (${activeTrack?.id}, ${user?.clerk_id});
            `;

            setIsFavorite(!isFavorite)
            console.log("toggleFavorite increased favorite")
        }

        getUserInfo()
        console.log("toggleFavorite ran")

    };

    const toggleUpvote = async () => {

        let wantsToUpvote = null

        console.log("toggleUpvote starting")

        // Check if the user has already upvoted
        const existingUpvote = await sql`
            SELECT * FROM upvotes 
            WHERE readio_id = ${activeTrack?.id} AND user_id = ${user?.clerk_id};
        `;

        console.log("toggleUpvote looked for existing upvotes")

        if (existingUpvote.length > 0) {
            wantsToUpvote = false;
            // Remove the upvote since unUpvoting
            await sql`
                DELETE FROM upvotes
                WHERE readio_id = ${activeTrack?.id} AND user_id = ${user?.clerk_id};
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
                WHERE clerk_id = ${user?.clerk_id};
            `;

            setIsUpvoted(!isUpvoted)
            console.log("toggleFavorite decreased upvotes")
        }

        if (existingUpvote.length === 0) {
            wantsToUpvote = true
            // Add an upvote since upvoting
            await sql`
                INSERT INTO upvotes (readio_id, user_id)
                VALUES (${activeTrack?.id}, ${user?.clerk_id});
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
                WHERE clerk_id = ${user?.clerk_id};
            `;

            setIsUpvoted(!isUpvoted)
            console.log("toggleFavorite increased upvotes")
        }

        getUserInfo()
        console.log("toggleUpvote ran")

    };

    const [alreadyFavorited, setAlreadyFavorited] = useState(false);
    const [alreadyUpvoted, setAlreadyUpvoted] = useState(false);

    useEffect(() => {
        if (activeTrack) {
            // // Set the favorite status
            // setIsFavorite(activeTrack?.favorited ?? false);

            // Check if the user has upvoted the track
            const checkUpvoteStatus = async () => {

                try {
                    const existingUpvote = await sql`
                        SELECT * FROM upvotes
                        WHERE readio_id = ${activeTrack.id} AND user_id = ${user?.clerk_id};
                    `;
                    console.log("existig", existingUpvote)

                    if (existingUpvote.length === 0) {
                        setIsUpvoted(false);
                    }

                    if (existingUpvote.length > 0) {
                        setIsUpvoted(true);
                    }

                } catch (error) {
                    console.log("Error checking upvote status:", error);
                }
            };

            const checkFavoriteStatus = async () => {
                try {
                    const existingUpvote = await sql`
                        SELECT * FROM favorites
                        WHERE readio_id = ${activeTrack.id} AND user_id = ${user?.clerk_id};
                    `;
                    console.log("existig", existingUpvote)

                    if (existingUpvote.length === 0) {
                        setIsFavorite(false);
                    }

                    if (existingUpvote.length > 0) {
                        setIsFavorite(true);
                    }

                } catch (error) {
                    console.log("Error checking upvote status:", error);
                }
            };

            const checkHomepageStatus = async () => {
                try {
                    const seeFeaturedStatus = await sql`
                        SELECT featured FROM readios
                        WHERE id = ${activeTrack.id}
                  `;

                    if (seeFeaturedStatus[0].featured === true) {
                        setTrackIsFeatured(true);
                    } else {
                        setTrackIsFeatured(false);
                    }
                } catch (error) {
                    console.log("Error checking featured status:", error);
                }
            };

            checkUpvoteStatus();
            checkFavoriteStatus();
            checkHomepageStatus();
        }
    }, [activeTrack, isFavorite, isUpvoted]);


    if (!selectedReadios) {
        return (
            <>
                <SafeAreaView>

                    <View style={[defaultStyles.container, { justifyContent: 'center' }]}>
                        <ActivityIndicator color={colors.icon} />
                        <Text allowFontScaling={false}>Station</Text>
                    </View>

                </SafeAreaView>
            </>
        )
    }

    useEffect(() => {
        const handleTracks = async () => {
            console.log("Updated selectedReadio ✅✅✅✅✅✅ ");

            // Handle tracks from selectedReadios
            if (Array.isArray(selectedReadios) && selectedReadios.length > 0) {
                for (const track of selectedReadios) {
                    await handleTrackSelect(track as Track, generateTracksListId('songs', track.title));
                }
                console.log("updated no lutus 🟥🟥🟥🟥🟥🟥")
                setPlayerMode?.("radio");
                // Play the track
                await TrackPlayer.play();
            }

            // Handle tracks from selectedLotusReadios
            if (Array.isArray(selectedLotusReadios) && selectedLotusReadios.length > 0) {
                for (const track of selectedLotusReadios) {
                    await handleTrackSelect(track, generateTracksListId('songs', track.title));
                }
                console.log("updated lotus 💛💛💛💛💛💛")
                setPlayerMode?.("radio");
                // Play the track
                await TrackPlayer.play();
            }

        };

        handleTracks();
    }, [selectedReadios, selectedLotusReadios]);

    const handleTrackSelect = async (selectedTracks: Track, songId: string) => {
        console.log("id: ", songId);

        // Add the selected track to the queue
        await TrackPlayer.add(selectedTracks);

        // Update queue and state for the radio function
        setActiveQueueId(songId); // Optionally update the active queue ID
        queueOffset.current = 0;  // Reset queue offset since we only have one track
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
    };

    const BlinkingRadioSymbol = () => {
        const blinkAnim = useRef(new ReactNativeAnimated.Value(0)).current;
        const fadeAnim = useRef(new ReactNativeAnimated.Value(0)).current; // Initial value for opacity: 0

        useEffect(() => {
            ReactNativeAnimated.loop(
                ReactNativeAnimated.sequence([
                    ReactNativeAnimated.timing(blinkAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    ReactNativeAnimated.timing(blinkAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, [blinkAnim]);

        useEffect(() => {
            if (sToast === true) {
                ReactNativeAnimated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();

                const timer = setTimeout(() => {
                    ReactNativeAnimated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }, 2000); // Toast will be visible for 2 seconds

                return () => clearTimeout(timer); // Cleanup timer on unmount
            }

        }, [sToast, setSToast, fadeAnim]);



        return (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5, width: '100%', justifyContent: 'space-between', paddingHorizontal: 25 }}>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>

                    <Animated.View style={{ opacity: blinkAnim }}>
                        <FontAwesome name="dot-circle-o" size={14} color="#ff0000" />
                    </Animated.View>
                    <Text allowFontScaling={false} style={{ color: colors.readioBlack, fontSize: 14 }}>{activeStationName} Station</Text>

                </View>
                <View>
                    {/* <FontAwesome onPress={handleStationPress} name="refresh" size={18} color="#fff" /> */}
                </View>
            </View>
        );
    };

    const handleDownload = async () => {

        setIsDownloading(true);
        try {
            const track = activeTrack;
            if (track?.url) {
                // Create a safe filename from the title
                const safeTitle = track.title?.replace(/[^a-z0-9]/gi, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') || 'Track';
                // First download the file with custom filename
                const response = await ReactNativeBlobUtil.config({
                    fileCache: true,
                    appendExt: 'mp3',
                    path: `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeTitle}.mp3` // Custom path with title
                }).fetch('GET', track.url);

                const filePath = response.path();

                const shareOptions = {
                    title: track.title,
                    message: track.title || "",
                    url: `file://${filePath}`, // Make sure to include file:// prefix
                    saveToFiles: true,
                };


                try {
                    setIsDownloading(false);
                    // Show share dialog with save option
                    await Share.share(shareOptions);
                } catch (error) {
                    console.error('Error sharing track:', error);
                }

                // Clean up the temporary file
                await response.flush();
            }
        } catch (error) {
            console.error('Error downloading track:', error);
        }
    }

    const updateFeatured = async () => {

        console.log("activeTrack?.featured: ", activeTrack?.featured)
        console.log("activeTrack?.id: ", activeTrack?.id)

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


        console.log("new featured: ", activeTrack?.featured)
        console.log("new id: ", activeTrack?.id)


        setFeatureArticleImage?.(updateNewResponse[0].image_urls)
        setFeatureArticleName?.(updateNewResponse[0].title)

        console.log("new featured: ", updateNewResponse[0].featured)
        console.log("new id: ", updateNewResponse[0].id)

        setTrackIsFeatured(updateNewResponse[0].featured)

        console.log('updated')

        router.push('/(tabs)/(home)/home')

        return updateNewResponse[0].featured
    }

    return (
        <>
            <LinearGradient style={{ flex: 1 }} colors={imageColors ? [imageColors.background, imageColors.primary] : [colors.readioWhite, colors.readioWhite]}>

                <View style={styles.overlayContainer}>

                    <SafeAreaView style={{ width: '100%', height: '100%' }}>
                        {sToast === true && (
                            <>
                                <Animated.View style={styles.toast}>
                                    <Text allowFontScaling={false}>{toastMessege}</Text>
                                </Animated.View>
                            </>
                        )}
                        <DismissPlayerSymbol></DismissPlayerSymbol>


                        <View style={{ flex: 1, marginTop: top + 10, marginBottom: bottom }}>
                            <View style={styles.artworkImageContainer}>

                                {activeTrack?.image === "" && (
                                    <Image
                                        source={{
                                            uri: getLocalImageUri('unknownArticle'),
                                        }} resizeMode="cover" style={styles.artworkImage} />
                                )}

                                {activeTrack?.image != "" && (
                                    <>
                                        <Animated.Image
                                            source={{ uri: getLocalImageUri('filter'), }} style={[styles.artworkImage, { zIndex: 1, opacity: 0.2, position: 'absolute' }]} resizeMode='cover'
                                            />
                                        <Animated.Image
                                            entering={FadeInUp.duration(500)}
                                            source={{
                                                uri: activeTrack?.image ?? getLocalImageUri('unknownArticle'),
                                            }} resizeMode="cover" style={styles.artworkImage} 
                                        />
                                    </>
                                )}

                            </View>

                            <TouchableOpacity
                            onPress={updateFeatured}
                                style={trackIsFeatured ? styles.adminFeaturedButton : styles.adminNotFeatured}
                            >
                                <Image
                                    style={{ width: 20, height: 20 }}
                                    source={{ uri: getLocalImageUri('blackLogo') }}
                                    resizeMode="contain"
                                />
                                <Text allowFontScaling={false} style={trackIsFeatured ? styles.adminButtonText : styles.adminNotFeaturedText}>{trackIsFeatured ? "Featured" : "Feature on Homepage?"}</Text>
                            </TouchableOpacity>

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


const DismissPlayerSymbol = () => {

    const { top } = useSafeAreaInsets()

    return (
        <View style={{
            position: 'absolute',
            top: top + 8,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center'
        }}>
            <View accessible={false} style={{
                width: 50,
                height: 8,
                borderRadius: 8,
                backgroundColor: colors.readioBlack,
                opacity: 0.7

            }} />
        </View>
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
        flex: 1,
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
        height: '85%',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
        gap: 20
    },
    artworkImage: {
        width: '90%',
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