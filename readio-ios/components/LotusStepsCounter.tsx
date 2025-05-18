import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LotusStepsContainer } from './LotusStepsContainer';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useLotusNotifications } from '@/helpers/providers/LotusNotificationProvider';

interface LotusStepCounterProps {
  currentStepCount: number;
  updateInterval?: number;
}

export const LotusStepCounter: React.FC<LotusStepCounterProps> = ({
  currentStepCount,
  updateInterval = 5
}) => {
  const [displayedSteps, setDisplayedSteps] = useState(0);
  const [opacity] = useState(new Animated.Value(1));
  const [iconScale] = useState(new Animated.Value(1));
  const [triggeredMilestones, setTriggeredMilestones] = useState<Set<number>>(new Set());
  const [fiveStepsHapticTriggered, setFiveStepsHapticTriggered] = useState(false);
  const { successFeedback, stepMilestone } = useLotusHaptic();
  const kgsStepTriggerSystem = [
    {
      stepMilestone: 100,
      title: 'Thoreau’s Way',
      body: 'It was Henry David Thoreau who said, ‘An early-morning walk is a blessing for the whole day.’ Stay blessed!',
    },
    {
      stepMilestone: 500,
      title: 'Gregory’s Grit',
      body: 'In 1971, Dick Gregory walked 3,000 miles to protest the Vietnam War and oppression. He used walking to make the world listen. There’s power in this humble practice. Every step counts.',
    },
    {
      stepMilestone: 1000,
      title: 'Lao Tzu Logic',
      body: 'The Chinese Philosopher Lao Tzu famously said, ‘A journey of a thousand miles begins with a single step.’ You’re already 1,000 steps into your journey. Keep going',
    },
    {
      stepMilestone: 1500,
      title: 'Nietzsche Was Right',
      body: 'It was the western psychologist Nietzsche who said, ‘All truly great thoughts are conceived while walking.’ So, what’s cooking up in you today?',
    },
    {
      stepMilestone: 2000,
      title: 'MLK in Motion',
      body: 'Dr. Martin Luther King Jr. said, ‘If you can’t fly then run, if you can’t run then walk…’ in other words keep moving!',
    },
    {
      stepMilestone: 2500,
      title: 'Khalil Gibran’s Silence',
      body: 'Khalil Gibran said, ‘Your soul is oftentimes a battlefield.’ But when you walk, you turn war into rhythm. Every step is a quiet victory.',
    },
    {
      stepMilestone: 3000,
      title: 'Plato’s Practice',
      body: 'The renowned philosopher Plato often taught while walking. His school—the Academy—was built in a sacred grove where ideas moved with the body. He believed motion unlocked the mind. What do you think about that?',
    },
    {
      stepMilestone: 3500,
      title: 'Rumi’s Rhythm',
      body: 'The Great Poet Rumi once said, ‘As you start to walk on the way, the way appears.’ A reminder that in Life, Each step creates the way forward.',
    },
    {
      stepMilestone: 4000,
      title: 'Assata’s Walk',
      body: 'Revolutionary hero and auntie of Tupac Shakur, Assata Shakur once wrote, ‘I believe in living. I believe in the fire of love and the sweat of truth.’ When love and truth inspires our daily walk in life, our sweat becomes a libation for our liberation.',
    },
    {
      stepMilestone: 4500,
      title: 'Harriet’s Footsteps',
      body: 'Freedom fighter Harriet Tubman didn’t just walk hundreds of miles for her own freedom—she did it to free others. May every step you take be an inspiration to others as well.',
    },
    {
      stepMilestone: 5000,
      title: 'The Salt Walker',
      body: 'In what became known as the Salt March, Mahatma Gandhi, the nonviolent freedom fighter walked 240 miles to the sea, and showed us: a single step can shake an empire. keep going.',
    },
    {
      stepMilestone: 5500,
      title: 'Einstein’s Reboot',
      body: 'Albert Einstein used daily walks to reset his mind. You don’t need equations. Just consistency.',
    },
    {
      stepMilestone: 6000,
      title: 'Quiet Moves',
      body: 'Dr. John Francis, the environmentalist who gave up all motorized travel for 22 years after witnessing an oil spill, walked across the U.S.—and even to South America—on foot. He also took a 17-year vow of silence. No car. No speaking. Just footsteps and presence. He once said: “I walk because it’s the most powerful statement I can make without saying a word.” Our steps may be quiet—but they can still speak volumes.',
    },
    {
      stepMilestone: 6500,
      title: 'Spirit Walk',
      body: 'Sri Chinmoy, the renowned Spiritual teacher and athlete, who coached Olympic legend Carl Lewis—believed walking and running were extensions of meditation. He organized peace walks across continents and founded the longest certified footrace in the world. To him, motion wasn’t about speed—it was about spirit. He said, “When we walk soulfully, every step becomes an inner offering.” So walk like prayer. Breathe like peace. Move like meaning.',
    },
    {
      stepMilestone: 7000,
      title: 'Bruce Lee Flow',
      body: 'Master martial artist, philosopher and actor Bruce Lee once wrote, “I’m not afraid to walk on this Earth. I walk on and face the fact. I walk on and see myself. I walk on and accept myself. I walk on and create myself. I walk on and live.” Walk on!',
    },
    {
      stepMilestone: 7500,
      title: 'Fannie’s Forward Motions',
      body: 'Fannie Lou Hamer, the civil rights warrior and sharecropper’s daughter, walked from town to town across Mississippi, knocking on doors to register Black voters at a time when that was a revolutionary act. She faced beatings, jail, and death threats—but kept going. She famously said: “I’m sick and tired of being sick and tired.” And so still—she walked. So if you’re tired today channel your inner Fannie Lou and walk anyway. You got this!',
    },
    {
      stepMilestone: 8000,
      title: 'Granny’s Grit',
      body: 'Emma “Grandma” Gatewood, the first woman to solo hike the Appalachian Trail, did it in canvas sneakers with a homemade sack—and she was 67 years old! No fancy gear. No sponsor. Just grit. She said simply: “I did it because I wanted to.” We don’t need permission, it’s the doing that gets things done!',
    },
    {
      stepMilestone: 9000,
      title: 'Serenity’s Stride',
      body: 'Thich Nhat Hanh, the Zen master of walking meditation, taught that every step is a miracle. Not to arrive—but to awaken. He said: “Walk as if you are kissing the Earth with your feet.” So be gentle. Be present. Walk like peace itself.',
    },
    {
      stepMilestone: 9750,
      title: 'Path of Peace',
      body: 'The Buddha walked barefoot for decades—village to village, through forests and dust, not for distance, but for presence. Each step was mindful. Each path, a lesson. He taught the Eightfold Path while walking it—literally. When we walk in peace we can take refuge in each step.',
    },
    {
      stepMilestone: 10000,
      title: '10k Club',
      body: 'That’s 10,000 steps. You didn’t rush. You didn’t quit. You just kept showing up—one foot at a time. And that’s how everything changes. Big transformations wear small shoes. Continue to Walk tall. You are on the path!',
    },
  ]
  const { scheduleNotification } = useLotusNotifications();

  useEffect(() => {
    const milestone = Math.floor(currentStepCount / updateInterval) * updateInterval;

    // Check if steps reached/passed 5 AND haptic hasn't been triggered yet
    if (!fiveStepsHapticTriggered && currentStepCount >= updateInterval) {
      console.log(`Triggering haptic for ${updateInterval} steps.`);
      successFeedback();
      stepMilestone();
      setFiveStepsHapticTriggered(true); // Mark as triggered
    }

    // --- NOTE - ARCHIVED Milestone Notification Logic ---
    // kgsStepTriggerSystem.forEach(async (trigger) => {
    //   // Check if the current step count meets the milestone and if it hasn't been triggered yet
    //   if (currentStepCount >= trigger.stepMilestone && !triggeredMilestones.has(trigger.stepMilestone)) {
    //     console.log(`Milestone condition met: ${trigger.stepMilestone} steps. Scheduling notification.`);
    //     // Add this milestone to the set *before* scheduling to prevent race conditions
    //     setTriggeredMilestones(prev => new Set(prev).add(trigger.stepMilestone));

    //     // NOTE Schedule the KGA notification
    //     try {
    //       await scheduleNotification(
    //         trigger.title,
    //         trigger.body,
    //         null,
    //         { type: 'stepMilestone' }, // Data object
    //         'Flute-Chime-Kgas.mp3' // Sound file name as the 5th argument
    //       );

    //       console.log(`Notification scheduled for ${trigger.stepMilestone} steps.`);

    //       // Trigger haptic feedback for milestone
    //       stepMilestone();
    //     } catch (error) {
    //       console.error(`Failed to schedule notification for milestone ${trigger.stepMilestone}:`, error);
    //     }
    //   }
    // });

// --- Displayed Steps Update Logic ---
    // Calculate the milestone based on the update interval for display purposes
    const displayMilestone = Math.floor(currentStepCount / updateInterval) * updateInterval;

    // Update displayed steps and animate icon if the display milestone is reached and different from current display
    if (currentStepCount >= displayMilestone && displayedSteps !== displayMilestone) {
      // console.log(`Updating displayed steps to: ${displayMilestone}`);
      setDisplayedSteps(displayMilestone);      // Animate icon
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }

  }, [currentStepCount, updateInterval, displayedSteps, triggeredMilestones, scheduleNotification, stepMilestone, fiveStepsHapticTriggered, successFeedback]); // Add new state to dependencies

  // return `${displayedSteps} steps and counting`;

  const getMessage = () => {
    return "Keep walking! \n Almost at 5 steps...";
  };

  {/* <Animated.View style={{ transform: [{ scale: iconScale }] }}>
    <MaterialCommunityIcons 
      name="shoe-print" 
      size={40} 
      color={colors.readioWhite} 
    />
  </Animated.View> */}
  return (
    <>
      <LotusStepsContainer>
        {currentStepCount < 5 && (
          <>
            <View style={{ paddingHorizontal: 16.18, }}>

              <Animated.Text
                allowFontScaling={false}
                style={{
                  color: colors.readioWhite,
                  fontFamily: readioBoldFont,
                  opacity: opacity,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                {getMessage()}
              </Animated.Text>
            </View>
          </>
        )}

        {currentStepCount >= 5 && (
          <>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 6.18 }}>
              <Animated.Text
                allowFontScaling={false}
                style={{
                  color: colors.readioWhite,
                  fontFamily: readioBoldFont,
                  fontSize: 40,
                  opacity: opacity,
                  textAlign: 'center',
                }}
              >
                {displayedSteps}
              </Animated.Text>
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <MaterialCommunityIcons
                  name="shoe-print"
                  size={40}
                  color={colors.readioWhite}
                />
              </Animated.View>
            </View>

            <View style={{ paddingHorizontal: 16.18, }}>
              <Text allowFontScaling={false} style={{ textAlign: 'center', color: colors.readioWhite, fontFamily: readioRegularFont }}>Steps and counting!</Text>
            </View>
          </>

        )}
      </LotusStepsContainer>
    </>
  );
};