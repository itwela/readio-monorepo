import React from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from "react-native";
import { colors, readioRegularFont } from "@/constants/tokens";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import LotusGap from "./LotusGap";

interface LoopingPromptsProps {
  onPromptSelect?: (promptText: string) => void;
}

const { width } = Dimensions.get('window');
const ideaPrompts = [
  "What George Benton’s Philly Shell can teach everyday life.",
  "Best plants for inspiring writers—and why they matter.",
  "Every Tribe Called Quest sample and the artists behind them.",
  "Captain Ibrahim Traoré: A brief timeline and his meaning.",
  "What could martial artists learn from beekeeping techniques?",
  "How would Sun Ra design a healing retreat center?",
  "Which herbs would Malcolm X grow in a home garden?",
  "What did Sade teach us about emotional discipline?",
  "Why should entrepreneurs study the drummers of West Africa?",
  "Could Bob Marley’s lyrics decode the modern attention economy?",
  "What could Bruce Lee teach about co-parenting with grace?",
  "What if Octavia Butler designed a curriculum for teenagers?",
  "What are 5 ways jazz improvisation sharpens emotional intelligence?",
  "What can fasting monks teach about creative momentum?",
  "How would Nina Simone structure a protest in 2025?",
  "What lessons do streetball players hold for startup founders?",
  "How would Muhammad Ali train a modern peacekeeper?",
  "What can we learn from Capoeira’s balance of fight and flow?",
  "How would Frida Kahlo redesign mental health therapy spaces?",
  "What would a prison abolitionist playlist sound like—and why?",
  "How would Lauryn Hill lead a songwriting class for fathers?",
  "What do samurai codes reveal about mastering your morning routine?",
  "What could Stoicism learn from Southern Black grandmothers?",
  "Why should brand strategists study Yoruba naming traditions?",
  "What if bell hooks coached conflict resolution in breakups?",
  "What would an African liberation martial arts syllabus include?",
  "How does hip-hop teach applied philosophy better than academia?",
  "What can breakdancing teach about neurological rewiring and aging?",
  "What would Prince teach about uncompromising creative boundaries?",
  "Why should we study herbalism like we study entrepreneurship?",
  "What if Malcolm X wrote a guide to emotional literacy?",
  "How would the Zapatistas design a parenting handbook?",
  "What would a Kendrick Lamar masterclass on restraint look like?",
  "Why should songwriters study the Tao Te Ching?",
  "What can monks teach about managing dopamine in a digital world?",
  "What if Muhammad Yunus taught hustle culture about real value?",
  "How would Toni Morrison teach self-worth in middle school?",
  "What if Assata Shakur ran a healing arts institute?",
  "What can shadowboxing teach about emotional processing?",
  "What would a Dilla approach to daily rituals look like?",
  "Why should wellness entrepreneurs study the Black Panther Party?",
  "How would Haile Selassie structure community justice in modern cities?",
  "What can graffiti culture teach about authorship and identity?",
  "What if James Baldwin wrote UX guidelines for social apps?",
  "How does martial arts philosophy apply to navigating creative burnout?",
  "Why should poets study boxing footwork?",
  "What would a Harriet Tubman travel journal reveal about intuition?",
  "How would a Yoruba priest design a goal-setting method?",
  "What if Miles Davis taught the art of knowing when to rest?",
  "What are five things hip-hop can teach the climate movement?"
];

const styles = StyleSheet.create({
  container: {
    height: 60,
    marginHorizontal: 15,
    marginBottom: 10
  },
  promptItem: {
    width: width - 30,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  promptText: {
    fontFamily: readioRegularFont,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center'
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 3
  },
  activeDot: {
    backgroundColor: colors.readioOrange
  }
});

const InspiringPrompts: React.FC<LoopingPromptsProps> = ({ onPromptSelect }) => {
  const { lightFeedback } = useLotusHaptic();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);

  const onScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (width - 30));
    setActiveIndex(index % ideaPrompts.length);
    lightFeedback();
  };

  return (
    <>
    <Text style={styles.promptText} allowFontScaling={false}>Swipe the clear box for more inspiring prompts:</Text>
    <LotusGap gapNumber={20} backgroundColor={'transparent'} />
    <LotusGap gapNumber={1} backgroundColor={'rgba(255,255,255,0.1)'} />
    <LotusGap gapNumber={20} backgroundColor={'transparent'} />
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={[...ideaPrompts, ...ideaPrompts, ...ideaPrompts]} // Triple for infinite feel
        renderItem={({ item, index }) => (
          <Pressable 
            // onPress={() => {
            //   onPromptSelect?.(item);
            //   lightFeedback();
            // }}
            style={styles.promptItem}>
            <Text  allowFontScaling={false} style={styles.promptText}>{item}</Text>
          </Pressable>
        )}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width - 30}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
      />
    </View>
    </>
  );
};

export default InspiringPrompts;
