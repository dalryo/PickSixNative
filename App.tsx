/**
 * PickSix MVP
 * Dalton Young - SENG 564 - Fall 2026
 * React Native + Expo + TypeScript
 *
 * Code-freeze MVP features:
 * - Home dashboard and bottom navigation
 * - Company-curated college football games
 * - School colors, rankings, records, and conferences
 * - Filters for All D-I, Power 4, Ranked, Group of 6, and Company Towns
 * - Winner selection plus predicted score entry
 * - Pick validation, submission, and locking
 * - Simulated live scores, leaderboard, and rewards
 * - Admin panel for week setup, game selection, scoring rules, and results
 *
 * This MVP intentionally uses sample/local data. Authentication, a production
 * database, live sports APIs, push notifications, and CI/CD are post-MVP items.
 */

import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---------- Types ----------
type Screen = "home" | "picks" | "live" | "leaders" | "rewards" | "admin";
type FilterCat = "all" | "power4" | "ranked" | "g6" | "company";
type AdminTab = "setup" | "games" | "scoring" | "results";

type Team = {
  name: string;
  abbr: string;
  bg: string;
  fg: string;
  rank?: number;
  record: string;
  conf: string;
};

type Game = {
  id: string;
  away: string;
  home: string;
  kickoff: string;
  network: string;
  cats: FilterCat[];
};

type GamePick = {
  winner?: string;
  awayScore: string;
  homeScore: string;
  submitted: boolean;
};

type ScoringRules = {
  winner: number;
  exact: number;
  within3: number;
  within7: number;
  within14: number;
  streak: number;
};

// ---------- Team and Game Data ----------
const TEAMS: Record<string, Team> = {
  WVU: { name: "West Virginia", abbr: "WVU", bg: "#002855", fg: "#EAAA00", record: "6-4", conf: "Big 12" },
  ISU: { name: "Iowa State", abbr: "ISU", bg: "#C8102E", fg: "#F1BE48", rank: 11, record: "8-2", conf: "Big 12" },
  OSU: { name: "Ohio State", abbr: "OSU", bg: "#BA0C2F", fg: "#FFFFFF", rank: 2, record: "9-1", conf: "Big Ten" },
  IU: { name: "Indiana", abbr: "IU", bg: "#990000", fg: "#DFCEA4", rank: 5, record: "9-1", conf: "Big Ten" },
  IOWA: { name: "Iowa", abbr: "IOWA", bg: "#000000", fg: "#FFCD00", record: "7-3", conf: "Big Ten" },
  NEB: { name: "Nebraska", abbr: "NEB", bg: "#E41C38", fg: "#FFFFFF", record: "7-3", conf: "Big Ten" },
  KU: { name: "Kansas", abbr: "KU", bg: "#003591", fg: "#FFFFFF", record: "5-5", conf: "Big 12" },
  KSU: { name: "Kansas State", abbr: "KSU", bg: "#512888", fg: "#FFFFFF", rank: 18, record: "8-2", conf: "Big 12" },
  MIA: { name: "Miami", abbr: "MIA", bg: "#F47321", fg: "#005030", rank: 10, record: "8-2", conf: "ACC" },
  TAMU: { name: "Texas A&M", abbr: "TAMU", bg: "#500000", fg: "#FFFFFF", rank: 13, record: "8-2", conf: "SEC" },
  UF: { name: "Florida", abbr: "UF", bg: "#FA4616", fg: "#003087", rank: 9, record: "8-2", conf: "SEC" },
  MISS: { name: "Ole Miss", abbr: "MISS", bg: "#CE1126", fg: "#FFFFFF", rank: 16, record: "7-3", conf: "SEC" },
  ARK: { name: "Arkansas", abbr: "ARK", bg: "#9D2235", fg: "#FFFFFF", record: "6-4", conf: "SEC" },
  MIZ: { name: "Missouri", abbr: "MIZ", bg: "#F1B300", fg: "#000000", rank: 15, record: "8-2", conf: "SEC" },
  SHSU: { name: "Sam Houston", abbr: "SHSU", bg: "#FF6600", fg: "#FFFFFF", record: "9-2", conf: "C-USA" },
  USD: { name: "South Dakota", abbr: "USD", bg: "#CC0000", fg: "#FFFFFF", record: "7-4", conf: "MVFC" },
};

const ALL_GAMES: Game[] = [
  { id: "g1", away: "IU", home: "OSU", kickoff: "Sat, Nov 30 · Noon ET", network: "FOX", cats: ["all", "power4", "ranked", "company"] },
  { id: "g2", away: "IOWA", home: "NEB", kickoff: "Sat, Nov 30 · 3:30 PM ET", network: "CBS", cats: ["all", "power4", "company"] },
  { id: "g3", away: "KU", home: "KSU", kickoff: "Sat, Nov 30 · 7:30 PM ET", network: "ESPN", cats: ["all", "power4", "ranked", "company"] },
  { id: "g4", away: "MIA", home: "TAMU", kickoff: "Sat, Nov 30 · 7:30 PM ET", network: "ABC", cats: ["all", "power4", "ranked", "company"] },
  { id: "g5", away: "ARK", home: "MIZ", kickoff: "Sat, Nov 30 · 3:30 PM ET", network: "CBS", cats: ["all", "power4", "ranked", "company"] },
  { id: "g6", away: "UF", home: "MISS", kickoff: "Sat, Nov 30 · 8:00 PM ET", network: "ESPN", cats: ["all", "power4", "ranked", "company"] },
  { id: "g7", away: "WVU", home: "ISU", kickoff: "Sat, Nov 30 · 3:30 PM ET", network: "ESPN", cats: ["all", "power4", "ranked", "company"] },
  { id: "g8", away: "SHSU", home: "USD", kickoff: "Sat, Nov 30 · 2:00 PM ET", network: "ESPN+", cats: ["all", "g6", "company"] },
];

const FILTERS: { id: FilterCat; label: string }[] = [
  { id: "all", label: "All D-I" },
  { id: "power4", label: "Power 4" },
  { id: "ranked", label: "Ranked" },
  { id: "g6", label: "Group of 6" },
  { id: "company", label: "Company Towns" },
];

const LIVE_GAMES = [
  { id: "l1", away: "WVU", home: "ISU", awayScore: 24, homeScore: 21, status: "3rd · 4:18", live: true },
  { id: "l2", away: "ARK", home: "MIZ", awayScore: 17, homeScore: 28, status: "FINAL", live: false },
  { id: "l3", away: "MIA", home: "TAMU", awayScore: 21, homeScore: 14, status: "3rd · 8:43", live: true },
];

const LEADERS = [
  { rank: 1, name: "Marcus Thompson", department: "Asset Mgmt", points: 1842, accuracy: 74 },
  { rank: 2, name: "Sarah Chen", department: "Leasing", points: 1798, accuracy: 71 },
  { rank: 3, name: "DeAndre Williams", department: "Maintenance", points: 1756, accuracy: 69 },
  { rank: 4, name: "Priya Patel", department: "Investments", points: 1731, accuracy: 70 },
  { rank: 5, name: "Jake Morrison", department: "Marketing", points: 1698, accuracy: 67 },
  { rank: 12, name: "Dalton Young", department: "Prop Mgmt", points: 1247, accuracy: 68 },
];

const REWARDS = [
  { id: "r1", title: "$50 Gift Card", description: "Weekly PickSix winner", type: "Weekly Prize", emoji: "💳" },
  { id: "r2", title: "$100 Gift Card", description: "Monthly points leader", type: "Monthly Prize", emoji: "🏆" },
  { id: "r3", title: "PickSix Champion", description: "Season champion recognition", type: "Season Prize", emoji: "👑" },
];

const RESULTS_DISTRIBUTION: Record<string, number> = {
  g1: 62,
  g2: 71,
  g3: 55,
  g4: 48,
  g5: 77,
  g6: 53,
  g7: 44,
  g8: 73,
};

function blankPick(): GamePick {
  return { winner: undefined, awayScore: "", homeScore: "", submitted: false };
}

function initialPicks(): Record<string, GamePick> {
  const data: Record<string, GamePick> = {};
  ALL_GAMES.forEach((game) => {
    data[game.id] = blankPick();
  });
  return data;
}

// ---------- Main Application ----------
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [picks, setPicks] = useState<Record<string, GamePick>>(initialPicks());
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(["g1", "g2", "g3", "g4", "g6", "g7"]);
  const [weekName, setWeekName] = useState("Week 8 - Rivalry Weekend");
  const [deadline, setDeadline] = useState("Sat, Nov 30 · 12:00 PM ET");
  const [notifications, setNotifications] = useState(true);
  const [scoring, setScoring] = useState<ScoringRules>({ winner: 10, exact: 25, within3: 10, within7: 7, within14: 5, streak: 2 });

  const submittedCount = selectedGameIds.filter((id) => picks[id]?.submitted).length;

  function updatePick(gameId: string, patch: Partial<GamePick>) {
    setPicks((current) => ({
      ...current,
      [gameId]: { ...(current[gameId] || blankPick()), ...patch },
    }));
  }

  function renderScreen() {
    if (screen === "home") {
      return (
        <HomeScreen
          weekName={weekName}
          submittedCount={submittedCount}
          gameCount={selectedGameIds.length}
          onGoToPicks={() => setScreen("picks")}
          onGoToAdmin={() => setScreen("admin")}
        />
      );
    }

    if (screen === "picks") {
      return (
        <PicksScreen
          gameIds={selectedGameIds}
          picks={picks}
          scoring={scoring}
          updatePick={updatePick}
        />
      );
    }

    if (screen === "live") return <LiveScreen />;
    if (screen === "leaders") return <LeaderboardScreen />;
    if (screen === "rewards") return <RewardsScreen />;

    return (
      <AdminScreen
        weekName={weekName}
        setWeekName={setWeekName}
        deadline={deadline}
        setDeadline={setDeadline}
        notifications={notifications}
        setNotifications={setNotifications}
        selectedGameIds={selectedGameIds}
        setSelectedGameIds={setSelectedGameIds}
        scoring={scoring}
        setScoring={setScoring}
        onBack={() => setScreen("home")}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <View style={styles.content}>{renderScreen()}</View>
        {screen !== "admin" && <BottomNav screen={screen} setScreen={setScreen} />}
      </View>
    </SafeAreaView>
  );
}

// ---------- Reusable Components ----------
function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  const items: { key: Screen; label: string; icon: string }[] = [
    { key: "home", label: "Home", icon: "⌂" },
    { key: "picks", label: "Picks", icon: "🏈" },
    { key: "live", label: "Live", icon: "●" },
    { key: "leaders", label: "Leaders", icon: "🏆" },
    { key: "rewards", label: "Rewards", icon: "🎁" },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const active = screen === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => setScreen(item.key)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.label}`}
          >
            <Text style={active ? styles.navIconActive : styles.navIcon}>{item.icon}</Text>
            <Text style={active ? styles.navTextActive : styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ScreenHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.screenHeader}>
      <Text style={styles.screenTitle}>{title}</Text>
      <Text style={styles.screenSubtitle}>{subtitle}</Text>
    </View>
  );
}

function FilterBar({ filter, setFilter }: { filter: FilterCat; setFilter: (filter: FilterCat) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {FILTERS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
          onPress={() => setFilter(item.id)}
        >
          <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function TeamBadge({ teamId, size = 46 }: { teamId: string; size?: number }) {
  const team = TEAMS[teamId];
  return (
    <View style={[styles.teamBadge, { width: size, height: size, borderRadius: size / 2, backgroundColor: team.bg }]}>
      <Text style={[styles.teamBadgeText, { color: team.fg }]}>{team.abbr}</Text>
    </View>
  );
}

function TeamChoice({ teamId, selected, disabled, onPress }: { teamId: string; selected: boolean; disabled: boolean; onPress: () => void }) {
  const team = TEAMS[teamId];
  return (
    <TouchableOpacity
      style={[
        styles.teamChoice,
        { borderColor: selected ? team.bg : "transparent" },
        selected && styles.teamChoiceSelected,
        disabled && !selected && styles.dimmed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`Pick ${team.name}`}
    >
      <TeamBadge teamId={teamId} size={52} />
      <View style={styles.teamChoiceText}>
        <Text style={styles.teamName}>{team.rank ? `#${team.rank} ${team.name}` : team.name}</Text>
        <Text style={styles.teamMeta}>{team.record} · {team.conf}</Text>
      </View>
      {selected && <Text style={[styles.checkmark, { color: team.bg }]}>✓</Text>}
    </TouchableOpacity>
  );
}

function NumberControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.numberControl}>
      <TouchableOpacity style={styles.stepButton} onPress={() => onChange(Math.max(0, value - 1))}>
        <Text style={styles.stepButtonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.numberValue}>{value}</Text>
      <TouchableOpacity style={styles.stepButton} onPress={() => onChange(value + 1)}>
        <Text style={styles.stepButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- Home ----------
function HomeScreen({
  weekName,
  submittedCount,
  gameCount,
  onGoToPicks,
  onGoToAdmin,
}: {
  weekName: string;
  submittedCount: number;
  gameCount: number;
  onGoToPicks: () => void;
  onGoToAdmin: () => void;
}) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.logo}>PickSix</Text>
            <Text style={styles.byline}>Dalton Young · SENG 564 MVP</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>DY</Text></View>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Season Pts" value="1,247" sub="#12 of 500" accent="#FF6B35" />
          <StatCard label="Accuracy" value="68%" sub="Season" accent="#00D4AA" />
          <StatCard label="Streak" value="🔥 5" sub="games" accent="#F59E0B" />
        </View>

        <View style={styles.countdownCard}>
          <View style={styles.flexOne}>
            <Text style={styles.weekText}>{weekName.toUpperCase()}</Text>
            <Text style={styles.countdownTitle}>Picks close Saturday</Text>
          </View>
          <Text style={styles.deadlineMini}>12 PM ET</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.primaryButton} onPress={onGoToPicks}>
          <Text style={styles.primaryButtonText}>⚡ MAKE YOUR PICKS</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{submittedCount}/{gameCount} locked</Text></View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Recent Result</Text>
          <TouchableOpacity onPress={onGoToAdmin}><Text style={styles.adminLink}>Admin Panel</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.resultRow}>
            <TeamBadge teamId="ARK" size={42} />
            <View style={styles.scoreArea}>
              <Text style={styles.score}>17 - 28</Text>
              <Text style={styles.mutedSmall}>FINAL</Text>
            </View>
            <TeamBadge teamId="MIZ" size={42} />
            <Text style={styles.pointsText}>+18</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leaderboard Preview</Text>
        <View style={styles.card}>
          {LEADERS.slice(0, 2).map((leader) => (
            <View key={leader.rank} style={styles.previewRow}>
              <Text style={styles.previewRank}>{leader.rank === 1 ? "🥇" : "🥈"}</Text>
              <View style={styles.flexOne}>
                <Text style={styles.rowTitle}>{leader.name}</Text>
                <Text style={styles.mutedSmall}>{leader.department}</Text>
              </View>
              <Text style={styles.rowPoints}>{leader.points}</Text>
            </View>
          ))}
          <View style={[styles.previewRow, styles.youRow]}>
            <Text style={styles.previewRank}>12</Text>
            <View style={styles.flexOne}>
              <Text style={styles.youName}>You</Text>
              <Text style={styles.mutedSmall}>Prop Mgmt</Text>
            </View>
            <Text style={styles.rowPoints}>1247</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

// ---------- Picks ----------
function PicksScreen({
  gameIds,
  picks,
  scoring,
  updatePick,
}: {
  gameIds: string[];
  picks: Record<string, GamePick>;
  scoring: ScoringRules;
  updatePick: (gameId: string, patch: Partial<GamePick>) => void;
}) {
  const [filter, setFilter] = useState<FilterCat>("all");
  const games = ALL_GAMES.filter((game) => gameIds.includes(game.id) && (filter === "all" || game.cats.includes(filter)));
  const submittedCount = gameIds.filter((id) => picks[id]?.submitted).length;

  function scoreContradictsWinner(game: Game) {
    const pick = picks[game.id];
    if (!pick?.winner || pick.awayScore === "" || pick.homeScore === "") return false;
    const away = Number(pick.awayScore);
    const home = Number(pick.homeScore);
    if (pick.winner === game.away) return away <= home;
    return home <= away;
  }

  function submitGame(game: Game) {
    const pick = picks[game.id] || blankPick();
    if (!pick.winner) {
      Alert.alert("Winner Required", "Select the team you think will win.");
      return;
    }
    if (pick.awayScore === "" || pick.homeScore === "") {
      Alert.alert("Score Required", "Enter a predicted score for both teams to qualify for score-accuracy points.");
      return;
    }
    if (scoreContradictsWinner(game)) {
      Alert.alert("Score Does Not Match Pick", "The team you selected as the winner must have the higher predicted score.");
      return;
    }
    updatePick(game.id, { submitted: true });
    Alert.alert("Pick Locked", "Winner and score prediction submitted for this MVP demo.");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Pick Games" subtitle={`${submittedCount}/${gameIds.length} competition picks locked`} />
      <FilterBar filter={filter} setFilter={setFilter} />

      <View style={styles.scoringHint}>
        <Text style={styles.scoringHintTitle}>Score prediction bonus</Text>
        <Text style={styles.scoringHintText}>
          Correct winner +{scoring.winner} · Exact +{scoring.exact} · Within 3 +{scoring.within3} · Within 7 +{scoring.within7}
        </Text>
      </View>

      {games.length === 0 && <Text style={styles.emptyText}>No selected competition games match this filter.</Text>}

      {games.map((game) => {
        const away = TEAMS[game.away];
        const home = TEAMS[game.home];
        const pick = picks[game.id] || blankPick();
        const contradiction = scoreContradictsWinner(game);

        return (
          <View style={styles.gameCard} key={game.id}>
            <View style={styles.gameTopRow}>
              <Text style={styles.gameNumber}>{game.kickoff}</Text>
              <Text style={styles.mutedSmall}>{game.network}</Text>
            </View>

            <TeamChoice
              teamId={game.away}
              selected={pick.winner === game.away}
              disabled={pick.submitted}
              onPress={() => updatePick(game.id, { winner: game.away })}
            />
            <Text style={styles.versus}>VS</Text>
            <TeamChoice
              teamId={game.home}
              selected={pick.winner === game.home}
              disabled={pick.submitted}
              onPress={() => updatePick(game.id, { winner: game.home })}
            />

            <Text style={styles.scorePredictionLabel}>SCORE PREDICTION · BONUS POINT ELIGIBLE</Text>
            <View style={styles.scoreInputsRow}>
              <View style={styles.scoreInputGroup}>
                <Text style={styles.scoreTeamLabel}>{away.abbr}</Text>
                <TextInput
                  style={[styles.scoreInput, contradiction && pick.winner === game.home && styles.scoreInputError]}
                  value={pick.awayScore}
                  onChangeText={(value) => updatePick(game.id, { awayScore: value.replace(/[^0-9]/g, "").slice(0, 2) })}
                  keyboardType="number-pad"
                  placeholder="--"
                  placeholderTextColor="#667286"
                  editable={!pick.submitted}
                  maxLength={2}
                />
              </View>
              <Text style={styles.scoreDash}>-</Text>
              <View style={styles.scoreInputGroup}>
                <TextInput
                  style={[styles.scoreInput, contradiction && pick.winner === game.away && styles.scoreInputError]}
                  value={pick.homeScore}
                  onChangeText={(value) => updatePick(game.id, { homeScore: value.replace(/[^0-9]/g, "").slice(0, 2) })}
                  keyboardType="number-pad"
                  placeholder="--"
                  placeholderTextColor="#667286"
                  editable={!pick.submitted}
                  maxLength={2}
                />
                <Text style={styles.scoreTeamLabel}>{home.abbr}</Text>
              </View>
            </View>

            {contradiction && <Text style={styles.errorText}>Predicted score must match your selected winner.</Text>}

            <TouchableOpacity
              style={[styles.lockButton, pick.submitted && styles.lockButtonDone]}
              onPress={() => submitGame(game)}
              disabled={pick.submitted}
            >
              <Text style={styles.lockButtonText}>
                {pick.submitted ? `✓ ${TEAMS[pick.winner || game.away].abbr} · ${pick.awayScore}-${pick.homeScore} LOCKED` : "LOCK IN PICK"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ---------- Simulated Live Scores ----------
function LiveScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ScreenHeader title="Live Scores" subtitle="Simulated Week 8 data for the MVP" />
      {LIVE_GAMES.map((game) => {
        const away = TEAMS[game.away];
        const home = TEAMS[game.home];
        return (
          <View style={styles.gameCard} key={game.id}>
            <View style={styles.liveStatusRow}>
              <Text style={game.live ? styles.liveText : styles.finalText}>{game.live ? "● LIVE" : "FINAL"}</Text>
              <Text style={styles.mutedSmall}>{game.status}</Text>
            </View>
            <View style={styles.liveTeamRow}>
              <View style={styles.inlineTeam}><TeamBadge teamId={game.away} size={36} /><View><Text style={styles.rowTitle}>{away.name}</Text><Text style={styles.mutedSmall}>{away.conf}</Text></View></View>
              <Text style={styles.liveScore}>{game.awayScore}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.liveTeamRow}>
              <View style={styles.inlineTeam}><TeamBadge teamId={game.home} size={36} /><View><Text style={styles.rowTitle}>{home.name}</Text><Text style={styles.mutedSmall}>{home.conf}</Text></View></View>
              <Text style={styles.liveScore}>{game.homeScore}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ---------- Leaderboard ----------
function LeaderboardScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ScreenHeader title="Leaderboard" subtitle="Season standings · Sample MVP data" />
      <View style={[styles.card, styles.horizontalMargin]}>
        {LEADERS.map((leader) => {
          const isYou = leader.name === "Dalton Young";
          const rankDisplay = leader.rank === 1 ? "🥇" : leader.rank === 2 ? "🥈" : leader.rank === 3 ? "🥉" : String(leader.rank);
          return (
            <View key={leader.rank} style={[styles.leaderRow, isYou && styles.youRow]}>
              <Text style={styles.leaderRank}>{rankDisplay}</Text>
              <View style={styles.flexOne}>
                <Text style={isYou ? styles.youName : styles.rowTitle}>{isYou ? "You" : leader.name}</Text>
                <Text style={styles.mutedSmall}>{leader.department} · {leader.accuracy}% accuracy</Text>
              </View>
              <Text style={styles.rowPoints}>{leader.points}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ---------- Rewards ----------
function RewardsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ScreenHeader title="Rewards" subtitle="Compete, earn points, and win prizes" />
      <View style={styles.pointsSummary}>
        <Text style={styles.mutedSmall}>Your Season Points</Text>
        <Text style={styles.pointsSummaryNumber}>1,247</Text>
        <Text style={styles.mutedSmall}>Currently ranked #12</Text>
      </View>
      {REWARDS.map((reward) => (
        <View style={styles.rewardCard} key={reward.id}>
          <View style={styles.rewardIcon}><Text style={styles.rewardEmoji}>{reward.emoji}</Text></View>
          <View style={styles.flexOne}>
            <Text style={styles.rowTitle}>{reward.title}</Text>
            <Text style={styles.rewardDescription}>{reward.description}</Text>
            <Text style={styles.rewardType}>{reward.type}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ---------- Admin ----------
function AdminScreen({
  weekName,
  setWeekName,
  deadline,
  setDeadline,
  notifications,
  setNotifications,
  selectedGameIds,
  setSelectedGameIds,
  scoring,
  setScoring,
  onBack,
}: {
  weekName: string;
  setWeekName: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  selectedGameIds: string[];
  setSelectedGameIds: (ids: string[]) => void;
  scoring: ScoringRules;
  setScoring: (rules: ScoringRules) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>("setup");
  const [filter, setFilter] = useState<FilterCat>("all");

  function toggleGame(id: string) {
    if (selectedGameIds.includes(id)) {
      setSelectedGameIds(selectedGameIds.filter((gameId) => gameId !== id));
    } else {
      setSelectedGameIds([...selectedGameIds, id]);
    }
  }

  function changeRule(key: keyof ScoringRules, value: number) {
    setScoring({ ...scoring, [key]: value });
  }

  const visibleAdminGames = ALL_GAMES.filter((game) => filter === "all" || game.cats.includes(filter));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.adminHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>‹</Text></TouchableOpacity>
        <View style={styles.flexOne}>
          <Text style={styles.screenTitle}>Admin Panel</Text>
          <Text style={styles.adminWarning}>MVP DEMO · No production authentication</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminTabs}>
        {([
          ["setup", "Week Setup"],
          ["games", "Select Games"],
          ["scoring", "Scoring"],
          ["results", "Results"],
        ] as [AdminTab, string][]).map(([id, label]) => (
          <TouchableOpacity key={id} style={[styles.adminTab, tab === id && styles.adminTabActive]} onPress={() => setTab(id)}>
            <Text style={[styles.adminTabText, tab === id && styles.adminTabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === "setup" && (
        <View style={styles.adminSection}>
          <Text style={styles.formLabel}>COMPETITION NAME</Text>
          <TextInput style={styles.formInput} value={weekName} onChangeText={setWeekName} placeholderTextColor="#667286" />

          <Text style={styles.formLabel}>PICKS DEADLINE</Text>
          <TextInput style={styles.formInput} value={deadline} onChangeText={setDeadline} placeholderTextColor="#667286" />

          <View style={styles.switchRow}>
            <View style={styles.flexOne}>
              <Text style={styles.rowTitle}>Competition notifications</Text>
              <Text style={styles.mutedSmall}>Deadline reminders, results, points, leaderboard changes</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert("Saved", "Competition settings saved in MVP state.")}>
            <Text style={styles.saveButtonText}>SAVE COMPETITION SETTINGS</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === "games" && (
        <View style={styles.adminSection}>
          <Text style={styles.adminIntro}>{selectedGameIds.length} games currently selected for the competition.</Text>
          <FilterBar filter={filter} setFilter={setFilter} />
          {visibleAdminGames.map((game) => {
            const selected = selectedGameIds.includes(game.id);
            const away = TEAMS[game.away];
            const home = TEAMS[game.home];
            return (
              <TouchableOpacity key={game.id} style={[styles.adminGameRow, selected && styles.adminGameSelected]} onPress={() => toggleGame(game.id)}>
                <Text style={styles.selectionBox}>{selected ? "✓" : ""}</Text>
                <TeamBadge teamId={game.away} size={32} />
                <View style={styles.flexOne}>
                  <Text style={styles.rowTitle}>{away.abbr} vs {home.abbr}</Text>
                  <Text style={styles.mutedSmall}>{game.kickoff} · {game.network}</Text>
                </View>
                <TeamBadge teamId={game.home} size={32} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {tab === "scoring" && (
        <View style={styles.adminSection}>
          <Text style={styles.adminIntro}>Configure how winner picks and score accuracy earn points.</Text>
          <ScoringRow label="Correct Winner" description="Base award for selecting the winner" value={scoring.winner} onChange={(v) => changeRule("winner", v)} />
          <ScoringRow label="Exact Score Bonus" description="Bonus for predicting the exact score" value={scoring.exact} onChange={(v) => changeRule("exact", v)} />
          <ScoringRow label="Score Within ±3" description="High-accuracy bonus" value={scoring.within3} onChange={(v) => changeRule("within3", v)} />
          <ScoringRow label="Score Within ±7" description="Medium-accuracy bonus" value={scoring.within7} onChange={(v) => changeRule("within7", v)} />
          <ScoringRow label="Score Within ±14" description="Low-accuracy bonus" value={scoring.within14} onChange={(v) => changeRule("within14", v)} />
          <ScoringRow label="Streak Bonus / Game" description="Additional reward for a correct-pick streak" value={scoring.streak} onChange={(v) => changeRule("streak", v)} />
          <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert("Saved", "Scoring rules saved in MVP state.")}>
            <Text style={styles.saveButtonText}>SAVE SCORING RULES</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === "results" && (
        <View style={styles.adminSection}>
          <Text style={styles.adminIntro}>Simulated pick distribution across 487 employees.</Text>
          {ALL_GAMES.filter((game) => selectedGameIds.includes(game.id)).map((game) => {
            const awayPct = RESULTS_DISTRIBUTION[game.id] || 50;
            const homePct = 100 - awayPct;
            const away = TEAMS[game.away];
            const home = TEAMS[game.home];
            return (
              <View style={styles.resultDistributionCard} key={game.id}>
                <View style={styles.distributionHeader}>
                  <View style={styles.inlineTeam}><TeamBadge teamId={game.away} size={28} /><Text style={styles.rowTitle}>{away.abbr}</Text></View>
                  <Text style={styles.mutedSmall}>487 picks</Text>
                  <View style={styles.inlineTeam}><Text style={styles.rowTitle}>{home.abbr}</Text><TeamBadge teamId={game.home} size={28} /></View>
                </View>
                <View style={styles.distributionBar}>
                  <View style={{ width: `${awayPct}%`, backgroundColor: away.bg }} />
                  <View style={{ width: `${homePct}%`, backgroundColor: home.bg }} />
                </View>
                <View style={styles.distributionLabels}>
                  <Text style={styles.mutedSmall}>{awayPct}% {away.abbr}</Text>
                  <Text style={styles.mutedSmall}>{home.abbr} {homePct}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function ScoringRow({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.scoringRow}>
      <View style={styles.flexOne}>
        <Text style={styles.rowTitle}>{label}</Text>
        <Text style={styles.mutedSmall}>{description}</Text>
      </View>
      <NumberControl value={value} onChange={onChange} />
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  app: { flex: 1, backgroundColor: "#091426" },
  content: { flex: 1 },
  screen: { flex: 1, backgroundColor: "#091426" },
  scrollContent: { paddingBottom: 28 },
  flexOne: { flex: 1 },
  horizontalMargin: { marginHorizontal: 16 },

  hero: { backgroundColor: "#0C192D", paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { fontSize: 40, fontWeight: "900", color: "#FFFFFF" },
  byline: { color: "#657084", fontSize: 11, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#3B82F6", borderWidth: 2, borderColor: "#FF6B35", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: "#152338", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  statLabel: { color: "#8B96A8", fontSize: 11 },
  statValue: { fontSize: 22, fontWeight: "900", marginTop: 3 },
  statSub: { color: "#657084", fontSize: 10, marginTop: 2 },

  countdownCard: { backgroundColor: "#142238", borderRadius: 16, padding: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  weekText: { color: "#FF6B35", fontSize: 10, fontWeight: "800", marginRight: 8 },
  countdownTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 4 },
  deadlineMini: { color: "#FFFFFF", backgroundColor: "#1D2B41", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, fontSize: 11, fontWeight: "800" },

  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginBottom: 10 },
  adminLink: { color: "#FF6B35", fontSize: 12, fontWeight: "800", marginBottom: 10 },
  primaryButton: { backgroundColor: "#FF6B35", paddingVertical: 16, borderRadius: 15, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  badge: { backgroundColor: "#FF8A62", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },

  card: { backgroundColor: "#132137", borderRadius: 16, overflow: "hidden" },
  resultRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  scoreArea: { flex: 1, alignItems: "center" },
  score: { color: "#FFFFFF", fontSize: 21, fontWeight: "900" },
  pointsText: { color: "#00D4AA", fontSize: 11, fontWeight: "900" },
  previewRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1D2A3D" },
  previewRank: { width: 34, color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  rowTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  rowPoints: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  mutedSmall: { color: "#7C8798", fontSize: 11, marginTop: 2 },
  youRow: { backgroundColor: "#2B2528" },
  youName: { color: "#FF6B35", fontSize: 15, fontWeight: "900" },

  screenHeader: { paddingHorizontal: 16, paddingTop: 24, marginBottom: 12 },
  screenTitle: { color: "#FFFFFF", fontSize: 30, fontWeight: "900" },
  screenSubtitle: { color: "#8B96A8", fontSize: 13, marginTop: 4 },

  filterRow: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  filterChip: { backgroundColor: "#131C2E", borderWidth: 1, borderColor: "#25334A", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  filterChipActive: { backgroundColor: "#FF6B35", borderColor: "#FF6B35" },
  filterText: { color: "#7C8798", fontSize: 11, fontWeight: "800" },
  filterTextActive: { color: "#FFFFFF" },

  scoringHint: { marginHorizontal: 16, marginBottom: 14, backgroundColor: "#152338", borderRadius: 14, padding: 12 },
  scoringHintTitle: { color: "#FF6B35", fontSize: 12, fontWeight: "900" },
  scoringHintText: { color: "#8B96A8", fontSize: 10, marginTop: 3, lineHeight: 15 },
  emptyText: { color: "#8B96A8", textAlign: "center", margin: 24 },

  gameCard: { marginHorizontal: 16, backgroundColor: "#132137", borderRadius: 16, padding: 14, marginBottom: 14 },
  gameTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  gameNumber: { color: "#FF6B35", fontSize: 11, fontWeight: "900" },

  teamChoice: { backgroundColor: "#1B2A40", borderRadius: 13, padding: 12, flexDirection: "row", alignItems: "center", borderWidth: 2 },
  teamChoiceSelected: { backgroundColor: "#243149" },
  teamChoiceText: { flex: 1, marginLeft: 12 },
  teamName: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  teamMeta: { color: "#8B96A8", fontSize: 11, marginTop: 2 },
  dimmed: { opacity: 0.55 },
  teamBadge: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  teamBadgeText: { fontWeight: "900", fontSize: 9 },
  checkmark: { fontSize: 22, fontWeight: "900" },
  versus: { color: "#667286", textAlign: "center", fontSize: 10, fontWeight: "900", marginVertical: 6 },

  scorePredictionLabel: { color: "#7C8798", fontSize: 9, fontWeight: "800", textAlign: "center", letterSpacing: 0.5, marginTop: 14, marginBottom: 8 },
  scoreInputsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  scoreInputGroup: { flexDirection: "row", alignItems: "center", gap: 7 },
  scoreTeamLabel: { color: "#A9B3C2", fontSize: 11, fontWeight: "900" },
  scoreInput: { width: 56, height: 46, borderRadius: 11, borderWidth: 1, borderColor: "#314158", backgroundColor: "#0E1A2B", color: "#FFFFFF", textAlign: "center", fontSize: 20, fontWeight: "900" },
  scoreInputError: { borderColor: "#EF4444" },
  scoreDash: { color: "#667286", fontSize: 20, fontWeight: "800" },
  errorText: { color: "#F87171", fontSize: 11, fontWeight: "700", textAlign: "center", marginTop: 8 },
  lockButton: { backgroundColor: "#FF6B35", borderRadius: 13, paddingVertical: 13, alignItems: "center", marginTop: 12 },
  lockButtonDone: { backgroundColor: "#153D36" },
  lockButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },

  liveStatusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  liveText: { color: "#FF6B35", fontSize: 11, fontWeight: "900" },
  finalText: { color: "#8B96A8", fontSize: 11, fontWeight: "900" },
  liveTeamRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9 },
  inlineTeam: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveScore: { color: "#FFFFFF", fontSize: 23, fontWeight: "900" },
  divider: { height: 1, backgroundColor: "#243249" },

  leaderRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#243249" },
  leaderRank: { width: 40, color: "#FFFFFF", fontSize: 17, fontWeight: "800" },

  pointsSummary: { marginHorizontal: 16, backgroundColor: "#132137", borderRadius: 16, padding: 18, alignItems: "center", marginBottom: 14 },
  pointsSummaryNumber: { color: "#FF6B35", fontSize: 36, fontWeight: "900", marginVertical: 3 },
  rewardCard: { marginHorizontal: 16, backgroundColor: "#132137", borderRadius: 16, padding: 15, marginBottom: 12, flexDirection: "row", alignItems: "center" },
  rewardIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#1D2B41", alignItems: "center", justifyContent: "center", marginRight: 13 },
  rewardEmoji: { fontSize: 24 },
  rewardDescription: { color: "#8B96A8", fontSize: 12, marginTop: 3, lineHeight: 16 },
  rewardType: { color: "#FF6B35", fontSize: 11, fontWeight: "800", marginTop: 5 },

  adminHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  backButton: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#17253A", alignItems: "center", justifyContent: "center" },
  backButtonText: { color: "#FFFFFF", fontSize: 28, lineHeight: 30 },
  adminWarning: { color: "#FF6B35", fontSize: 9, fontWeight: "900", marginTop: 2 },
  adminTabs: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  adminTab: { backgroundColor: "#131C2E", borderWidth: 1, borderColor: "#25334A", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  adminTabActive: { backgroundColor: "#FF6B35", borderColor: "#FF6B35" },
  adminTabText: { color: "#7C8798", fontSize: 11, fontWeight: "800" },
  adminTabTextActive: { color: "#FFFFFF" },
  adminSection: { paddingHorizontal: 16 },
  adminIntro: { color: "#8B96A8", fontSize: 12, marginBottom: 12, lineHeight: 18 },

  formLabel: { color: "#8B96A8", fontSize: 10, fontWeight: "900", letterSpacing: 0.7, marginBottom: 7, marginTop: 10 },
  formInput: { backgroundColor: "#132137", borderWidth: 1, borderColor: "#25334A", borderRadius: 12, color: "#FFFFFF", paddingHorizontal: 13, paddingVertical: 12, fontSize: 13 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#132137", borderRadius: 14, padding: 14, marginTop: 16 },
  saveButton: { backgroundColor: "#FF6B35", borderRadius: 13, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  saveButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },

  adminGameRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#131C2E", borderWidth: 1, borderColor: "#25334A", borderRadius: 13, padding: 11, marginBottom: 9 },
  adminGameSelected: { borderColor: "#FF6B35", backgroundColor: "#2A2330" },
  selectionBox: { width: 22, height: 22, borderRadius: 6, backgroundColor: "#263852", color: "#FFFFFF", textAlign: "center", paddingTop: 2, fontWeight: "900" },

  scoringRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#132137", borderRadius: 13, padding: 13, marginBottom: 9 },
  numberControl: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepButton: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#263852", alignItems: "center", justifyContent: "center" },
  stepButtonText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", lineHeight: 22 },
  numberValue: { color: "#FF6B35", width: 30, textAlign: "center", fontSize: 18, fontWeight: "900" },

  resultDistributionCard: { backgroundColor: "#132137", borderRadius: 13, padding: 12, marginBottom: 10 },
  distributionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  distributionBar: { height: 9, borderRadius: 6, overflow: "hidden", flexDirection: "row", marginTop: 10 },
  distributionLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },

  bottomNav: { backgroundColor: "#0D192B", borderTopWidth: 1, borderTopColor: "#1E2A3D", flexDirection: "row", paddingTop: 9, paddingBottom: 12 },
  navItem: { flex: 1, alignItems: "center", minHeight: 48, justifyContent: "center" },
  navIcon: { color: "#697487", fontSize: 16, marginBottom: 2 },
  navIconActive: { color: "#FF6B35", fontSize: 18, marginBottom: 2 },
  navText: { color: "#697487", fontSize: 9 },
  navTextActive: { color: "#FF6B35", fontSize: 9, fontWeight: "800" },
});
