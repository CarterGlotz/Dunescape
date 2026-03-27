/**
 * Solara Sun Bot — Discord Bot
 * Innovation #4: Invite to any Discord server to broadcast live sun state,
 * leaderboard, and Oracle broadcasts.
 *
 * Setup:
 *   1. npm install discord.js @supabase/supabase-js dotenv
 *   2. Create .env with DISCORD_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY, GUILD_IDS (comma-separated)
 *   3. node index.js
 *
 * Slash commands:
 *   /sun       — current sun brightness and phase
 *   /top       — today's top 5 wave runners
 *   /graves    — recent 5 graves and epitaphs
 *   /season    — season info and death count
 */

require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!SUPABASE_URL || !SUPABASE_KEY || !TOKEN) {
  console.error('[SolaraBot] Missing env vars. Check .env file.');
  process.exit(1);
}

// Lightweight Supabase REST helper (no SDK dependency)
async function sbFetch(table, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
  const r = await fetch(url, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${r.statusText}`);
  return r.json();
}

function getPhaseLabel(b) {
  if (b > 80) return { label: 'Full Dawn', color: 0xf0c040, icon: '☀️' };
  if (b > 60) return { label: 'Amber Warning', color: 0xe08020, icon: '🌤️' };
  if (b > 40) return { label: 'The Twilight', color: 0xc06020, icon: '🌅' };
  if (b > 20) return { label: 'The Dimming', color: 0xa03010, icon: '🌑' };
  return { label: 'The Eclipse', color: 0x802010, icon: '⚫' };
}

function getDailySeed() {
  const d = new Date();
  return `solara-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Register slash commands
const commands = [
  new SlashCommandBuilder().setName('sun').setDescription('Current Solara sun brightness and phase'),
  new SlashCommandBuilder().setName('top').setDescription("Today's top wave runners"),
  new SlashCommandBuilder().setName('graves').setDescription('Recent graves and epitaphs from the Living Map'),
  new SlashCommandBuilder().setName('season').setDescription('Season info, death count, and sun trajectory'),
].map(c => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('[SolaraBot] Slash commands registered globally.');
  } catch (e) {
    console.error('[SolaraBot] Failed to register commands:', e.message);
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`[SolaraBot] Logged in as ${client.user.tag}`);
  // Check sun every 5 minutes for Oracle broadcast threshold crossings
  setInterval(checkOracleBroadcast, 5 * 60 * 1000);
});

let lastBrightness = 100;
const BROADCAST_THRESHOLDS = [60, 40, 20];
const broadcastFired = new Set();

async function checkOracleBroadcast() {
  try {
    const data = await sbFetch('sun_state', '?select=brightness&limit=1');
    const b = Math.round(Number(data?.[0]?.brightness || 100));
    for (const threshold of BROADCAST_THRESHOLDS) {
      if (lastBrightness > threshold && b <= threshold && !broadcastFired.has(threshold)) {
        broadcastFired.add(threshold);
        await fireOracleBroadcast(b, threshold);
      }
    }
    lastBrightness = b;
  } catch (e) { console.warn('[SolaraBot] Oracle check failed:', e.message); }
}

async function fireOracleBroadcast(brightness, threshold) {
  const msgs = {
    60: 'Citizens of Solara. I count the fallen. The Eye grows brighter. The sun has crossed into Amber Warning.',
    40: 'The Twilight falls. I have watched this desert for longer than your name exists. The sun dims. Act now, or remember this moment as the one where you did nothing.',
    20: 'The Eclipse is near. This is my final broadcast before the Sunfall Event. Every death now matters more than all the deaths before. I am ready. Are you?',
  };
  const embed = new EmbedBuilder()
    .setColor(0x7a4090)
    .setTitle('📢 The Oracle Speaks')
    .setDescription(`*"${msgs[threshold]}"*`)
    .addFields(
      { name: '☀ Sun Brightness', value: `${brightness}%`, inline: true },
      { name: '🌑 Phase', value: getPhaseLabel(brightness).label, inline: true },
    )
    .setFooter({ text: `Solara: Sunfall · Season 1: The Wandering Comet` })
    .setTimestamp();

  for (const [, guild] of client.guilds.cache) {
    const channel = guild.systemChannel || guild.channels.cache.find(c => c.name.includes('solara') || c.name.includes('general'));
    if (channel?.isTextBased()) {
      try { await channel.send({ embeds: [embed] }); } catch (e) {}
    }
  }
  console.log(`[SolaraBot] Oracle broadcast fired at ${threshold}% threshold.`);
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'sun') {
    await interaction.deferReply();
    try {
      const data = await sbFetch('sun_state', '?select=brightness,total_deaths,season,season_name&limit=1');
      const row = data?.[0];
      const b = Math.round(Number(row?.brightness || 100));
      const phase = getPhaseLabel(b);
      const deaths = Number(row?.total_deaths || 0).toLocaleString();
      const bar = '█'.repeat(Math.round(b / 5)) + '░'.repeat(20 - Math.round(b / 5));
      const embed = new EmbedBuilder()
        .setColor(phase.color)
        .setTitle(`${phase.icon} Solara Sun Status`)
        .setDescription(`\`${bar}\` **${b}%**`)
        .addFields(
          { name: 'Phase', value: phase.label, inline: true },
          { name: 'Total Deaths', value: deaths, inline: true },
          { name: 'Season', value: `${row?.season || 1}: ${row?.season_name || 'The Wandering Comet'}`, inline: false },
        )
        .setFooter({ text: 'Play free → vaultsparkstudios.github.io/solara/' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply('Could not reach the sun state. Supabase may be offline.');
    }
  }

  if (commandName === 'top') {
    await interaction.deferReply();
    try {
      const seed = getDailySeed();
      const data = await sbFetch('daily_scores', `?select=player_name,wave_reached,faction&eq.date_seed=${seed}&order=wave_reached.desc&limit=5`);
      if (!data?.length) { await interaction.editReply('No scores yet today. Be the first!'); return; }
      const rows = data.map((e, i) => {
        const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
        const fIcon = e.faction === 'sunkeeper' ? '☀' : e.faction === 'eclipser' ? '🌑' : '⚖';
        return `${medal} **${e.player_name}** — Wave ${e.wave_reached}${e.wave_reached >= 30 ? ' 🏆' : ''} ${fIcon}`;
      }).join('\n');
      const embed = new EmbedBuilder()
        .setColor(0xc8a84e)
        .setTitle("☀️ Today's Top Runs")
        .setDescription(rows)
        .setFooter({ text: `Day seed: ${seed} · Play → vaultsparkstudios.github.io/solara/` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply('Could not load the leaderboard.');
    }
  }

  if (commandName === 'graves') {
    await interaction.deferReply();
    try {
      const data = await sbFetch('graves', '?select=player_name,epitaph,wave_reached,faction,sunstone_offerings&order=created_at.desc&limit=5');
      if (!data?.length) { await interaction.editReply('No graves on the map yet. Be the first to fall.'); return; }
      const rows = data.map(g => {
        const fIcon = g.faction === 'sunkeeper' ? '☀' : g.faction === 'eclipser' ? '🌑' : '⚖';
        return `✝ **${g.player_name}** (Wave ${g.wave_reached || 0}) ${fIcon}\n*"${g.epitaph || 'They fell without words.'}"*\n🌟 ${g.sunstone_offerings || 0} offerings`;
      }).join('\n\n');
      const embed = new EmbedBuilder()
        .setColor(0x7a4090)
        .setTitle('✝ Recent Graves — The Living Map')
        .setDescription(rows)
        .setFooter({ text: 'Browse all graves → vaultsparkstudios.github.io/solara/archive.html' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply('Could not load graves from the Living Map.');
    }
  }

  if (commandName === 'season') {
    await interaction.deferReply();
    try {
      const data = await sbFetch('sun_state', '?select=brightness,total_deaths,season,season_name,last_updated&limit=1');
      const row = data?.[0];
      const b = Math.round(Number(row?.brightness || 100));
      const deaths = Number(row?.total_deaths || 0).toLocaleString();
      const deathWeight = 0.0008;
      const deathsToZero = b / deathWeight;
      const embed = new EmbedBuilder()
        .setColor(0xc06020)
        .setTitle(`🌑 Season ${row?.season || 1}: ${row?.season_name || 'The Wandering Comet'}`)
        .addFields(
          { name: '☀ Sun Brightness', value: `${b}%`, inline: true },
          { name: '💀 Total Deaths', value: deaths, inline: true },
          { name: '📉 Deaths to Sunfall', value: `~${Math.round(deathsToZero).toLocaleString()} more deaths will end the season`, inline: false },
          { name: '⏰ Last Updated', value: row?.last_updated ? new Date(row.last_updated).toLocaleString() : 'Unknown', inline: false },
        )
        .setFooter({ text: 'Play → vaultsparkstudios.github.io/solara/ · Archive → /archive.html' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply('Could not load season data.');
    }
  }
});

registerCommands().then(() => client.login(TOKEN));
