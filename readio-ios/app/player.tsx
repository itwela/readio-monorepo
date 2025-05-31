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
import { colors, fontSize, readioBoldFont } from "@/constants/tokens"
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
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'


export default function Player() {

    const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
    const activeTrackFromHook = useActiveTrack()
    const activeTrack = activeTrackFromHook || lastActiveTrack
    const { top, bottom } = useSafeAreaInsets()
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
    const { activeQueueId } = useQueue()
    const [isDownloading, setIsDownloading] = useState(false)
    const queueOffset = useRef(0)
    const { lightFeedback, mediumFeedback, successFeedback, errorFeedback } = useLotusHaptic()

    // Import Convex mutations
    const toggleFavoriteMutation = useMutation(api.favorites.toggleFavorite);
    const toggleUpvoteMutation = useMutation(api.upvotes.toggleUpvote);
    const updateArticleUpvotesMutation = useMutation(api.articles.updateArticleUpvotes);
    const setArticleFeaturedMutation = useMutation(api.articles.setArticleFeatured);
    const autoAddToBookmarkedPlaylistMutation = useMutation(api.playlists.autoAddToBookmarkedPlaylist);
    const checkUserFavoriteQuery = useQuery(api.favorites.checkUserFavorite, 
        activeTrack?._id && user?.user_db_id ? {
            article_id: activeTrack._id,
            user_id: user.user_db_id
        } : "skip"
    );
    const checkUserUpvoteQuery = useQuery(api.upvotes.checkUserUpvote,
        activeTrack?._id && user?.user_db_id ? {
            article_id: activeTrack._id,
            user_id: user.user_db_id
        } : "skip"
    );

    const [isFavorite, setIsFavorite] = useState(false)
    const [isUpvoted, setIsUpvoted] = useState(false)
    const [trackIsFeatured, setTrackIsFeatured] = useState(false)
    const [hasBookmark, setHasBookmark] = useState(false)

    // Progress tracking for the current track
    const progressTracking = useProgressTracking({
        contentType: activeTrack?.contentType === 'liner_notes' ? 'liner_note' : 'audiobook',
        contentId: activeTrack?._id || '',
        contentName: activeTrack?.title || '',
    });

    // Check for existing bookmark when track changes
    useEffect(() => {
        const checkBookmark = async () => {
            if (activeTrack?._id) {
                const savedProgress = await progressTracking.loadSavedProgress();
                setHasBookmark(!!savedProgress && savedProgress.position_seconds > 0);
            }
        };
        checkBookmark();
    }, [activeTrack?._id]);

    // Manual bookmark function
    const handleBookmark = async () => {
        const success = await progressTracking.saveCurrentProgress();
        
        if (success) {
            setHasBookmark(true);
            
            // 🎯 ALSO ADD TO CONTINUE READING PLAYLIST when manually bookmarked
            if (activeTrack?._id && user?.user_db_id && activeTrack.contentType === 'article') {
                try {
                    await autoAddToBookmarkedPlaylistMutation({
                        user_db_id: user.user_db_id,
                        articleId: activeTrack._id as Id<"articles">
                    });
                    console.log('📚 Added to Continue Reading playlist via bookmark');
                } catch (error) {
                    console.error('Error adding to Continue Reading playlist:', error);
                    // Don't fail the bookmark if playlist addition fails
                }
            }
            
            // Refresh the current progress to get the updated bookmark position
            const updatedProgress = await progressTracking.loadSavedProgress();
            if (updatedProgress) {
                // console.log('📍 Updated bookmark position:', updatedProgress.position_seconds);
            }
            successFeedback();
            // showToast("Position bookmarked!");
        } else {
            errorFeedback();
            // showToast("Failed to bookmark position");
        }
    };

    // Resume from bookmark function
    const handleResumeFromBookmark = async () => {
        const success = await progressTracking.seekToSavedPosition();
        if (success) {
            successFeedback();
            // showToast("Resumed from bookmark!");
        } else {
            errorFeedback();
            // showToast("No bookmark found");
        }
    };

    const showToast = (message: string) => {
        setSToast(true)
        setToastMessege(message)
        setTimeout(() => {
            setSToast(false)
        }, 3000)
    };

    const hideToast = () => {
        setSToast(false)
        setToastMessege('')
    }

    // Sync favorite and upvote state from queries
    useEffect(() => {
        setIsFavorite(!!checkUserFavoriteQuery);
        setIsUpvoted(!!checkUserUpvoteQuery);
    }, [checkUserFavoriteQuery, checkUserUpvoteQuery]);

    // Toggle favorite function using Convex
    const toggleFavorite = async () => {
        if (!activeTrack?._id || !user?.user_db_id) return;
        
        try {
            const result = await toggleFavoriteMutation({
                article_id: activeTrack._id,
                user_id: user.user_db_id
            });
            setIsFavorite(result.favorited);
            successFeedback();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            errorFeedback();
        }
    };

    // Toggle upvote function using Convex
    const toggleUpvote = async () => {
        if (!activeTrack?._id || !user?.user_db_id) return;
        
        try {
            const result = await toggleUpvoteMutation({
                article_id: activeTrack._id,
                user_id: user.user_db_id
            });
            
            // Also update the article's upvote count
            await updateArticleUpvotesMutation({
                articleId: activeTrack._id,
                increment: result.upvoted
            });
            
            setIsUpvoted(result.upvoted);
            successFeedback();
        } catch (error) {
            console.error('Error toggling upvote:', error);
            errorFeedback();
        }
    };

    const getUserInfo = async () => {
        const userInfo = await sql`SELECT * FROM users WHERE jwt = ${user?.jwt}`
        // console.log("userInfo: ", userInfo[0]);
    };




    // Consolidated effect for track status checks

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

    return (
        <>
            <LinearGradient style={{ flex: 1 }} colors={imageColors ? [imageColors.background, imageColors.primary] : [colors.readioWhite, colors.readioWhite]}>

                {/* Toast notification */}
                {sToast && (
                    <Animated.View 
                        entering={FadeInUp.duration(300)} 
                        exiting={FadeInDown.duration(300)}
                        style={styles.toast}
                    >
                        <Text allowFontScaling={false} style={{ color: colors.readioBlack, fontWeight: 'bold' }}>
                            {toastMessege}
                        </Text>
                    </Animated.View>
                )}

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
                                        <View style={{ display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            {/* Upvote button */}
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
                                            
                                            {/* Favorite button */}
                                            <TouchableOpacity
                                                onPress={toggleFavorite}
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

                                            {/* Bookmark buttons - only show for non-radio content */}
                                            <TouchableOpacity
                                                onPress={handleBookmark}
                                                activeOpacity={0.7}
                                                style={styles.controlButton}
                                            >
                                                <IconSymbol
                                                    name={hasBookmark ? 'bookmark.fill' : 'bookmark'}
                                                    size={24}
                                                    color={colors.readioOrange}
                                                    style={{ opacity: 0.9 }}
                                                />
                                            </TouchableOpacity>
                                            
                                            {hasBookmark && (
                                                <TouchableOpacity
                                                    onPress={handleResumeFromBookmark}
                                                    activeOpacity={0.7}
                                                    style={styles.controlButton}
                                                >
                                                    <Text style={{ fontSize: 16, color: colors.readioOrange, fontFamily: readioBoldFont }}>Resume</Text>
                                                </TouchableOpacity>
                                            )}
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

                                    <PlayerProgressBar 
                                        style={{}}
                                        bookmarkPosition={hasBookmark ? progressTracking.currentProgress?.position_seconds : undefined}
                                    ></PlayerProgressBar>

                                    <PlayerControls style={{}}></PlayerControls>

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
        // borderRadius: 100,
        justifyContent: 'center',
        // alignItems: 'center',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        // shadowRadius: 2,
        // elevation: 2,
        // transform: [{ scale: 1 }]
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
