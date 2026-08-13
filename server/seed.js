const bcrypt = require('bcryptjs');
const { run, query, get, initSchema } = require('./models/db');

const seedData = async () => {
  try {
    await initSchema();

    // 1. Seed Admin User
    const existingAdmin = await get(`SELECT * FROM users WHERE username = ?`, ['admin']);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('toxic123', 10);
      await run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [
        'admin',
        hashedPassword,
        'admin'
      ]);
      console.log('Seeded default admin user: username="admin", password="toxic123"');
    }

    // 2. Seed Tournaments
    const tourneyCount = await get(`SELECT COUNT(*) as count FROM tournaments`);
    if (tourneyCount.count === 0) {
      const t1 = await run(
        `INSERT INTO tournaments (title, game_mode, format, prize_pool, entry_fee, max_teams, registered_teams, start_date, status, banner_url, rules, schedule, prize_breakdown)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'ToxicNullified Masters Season 1',
          'Squad TPP',
          'Squad',
          50000,
          250,
          64,
          42,
          '2026-08-20T18:00',
          'Registration Open',
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
          JSON.stringify([
            'Emulators are strictly prohibited. Mobile devices only.',
            'Hacking, scripting, or exploiting glitches will result in immediate lifetime ban.',
            'All players must record clean POV gameplay with discord audio for anti-cheat verification.',
            'Teams must join custom room 10 minutes prior to match schedule.',
            'Minimum account level 40 required for all players.'
          ]),
          JSON.stringify([
            { day: 'Day 1 - Group Stage A', date: '2026-08-20', matches: 'Erangel, Miramar, Sanhok' },
            { day: 'Day 2 - Group Stage B', date: '2026-08-21', matches: 'Erangel, Miramar, Vikendi' },
            { day: 'Day 3 - Semi Finals', date: '2026-08-22', matches: 'Erangel, Miramar, Erangel' },
            { day: 'Day 4 - Grand Finals', date: '2026-08-23', matches: '5 Matches Rotation' }
          ]),
          JSON.stringify([
            { rank: '1st Place (WWCD Champions)', amount: '₹ 25,000 + Trophy & Badges' },
            { rank: '2nd Place (Runners-Up)', amount: '₹ 12,000' },
            { rank: '3rd Place', amount: '₹ 6,000' },
            { rank: '4th - 5th Place', amount: '₹ 2,000 each' },
            { rank: 'MVP (Most Valuable Player)', amount: '₹ 3,000' }
          ])
        ]
      );

      const t2 = await run(
        `INSERT INTO tournaments (title, game_mode, format, prize_pool, entry_fee, max_teams, registered_teams, start_date, status, banner_url, rules, schedule, prize_breakdown)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Nullified Duo Showdown #4',
          'Duo TPP',
          'Duo',
          15000,
          100,
          50,
          50,
          '2026-08-15T19:00',
          'Ongoing',
          'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
          JSON.stringify([
            'Duo Mode only. Teaming up with enemy duos leads to disqualification.',
            'Proof of match stats screenshot mandatory after every round.',
            'Point calculation: 1 Kill = 1 Point. Placement points as per Official BGMI scoring rule.'
          ]),
          JSON.stringify([
            { day: 'Qualifiers', date: '2026-08-15', matches: 'Erangel & Miramar' },
            { day: 'Finals', date: '2026-08-16', matches: '3 Matches' }
          ]),
          JSON.stringify([
            { rank: '1st Place', amount: '₹ 8,000' },
            { rank: '2nd Place', amount: '₹ 4,000' },
            { rank: '3rd Place', amount: '₹ 3,000' }
          ])
        ]
      );

      const t3 = await run(
        `INSERT INTO tournaments (title, game_mode, format, prize_pool, entry_fee, max_teams, registered_teams, start_date, status, banner_url, rules, schedule, prize_breakdown)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'BGMI Weekly Solo Cyber Cup',
          'Solo FPP',
          'Solo',
          5000,
          0,
          100,
          88,
          '2026-08-25T16:00',
          'Registration Open',
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
          JSON.stringify([
            'Free entry tournament for solo players!',
            'First Person Perspective (FPP) Erangel match.',
            'Top 3 solo survivors win cash prizes.'
          ]),
          JSON.stringify([
            { day: 'Single Elimination Match', date: '2026-08-25', matches: 'Erangel FPP' }
          ]),
          JSON.stringify([
            { rank: '1st Survivor', amount: '₹ 2,500' },
            { rank: '2nd Survivor', amount: '₹ 1,500' },
            { rank: '3rd Survivor', amount: '₹ 1,000' }
          ])
        ]
      );

      const t4 = await run(
        `INSERT INTO tournaments (title, game_mode, format, prize_pool, entry_fee, max_teams, registered_teams, start_date, status, banner_url, rules, schedule, prize_breakdown)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Toxic Pro League Invitational',
          'Squad TPP',
          'Squad',
          100000,
          500,
          32,
          32,
          '2026-08-01T18:00',
          'Completed',
          'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1200&q=80',
          JSON.stringify(['Tier 1 & Tier 2 Invitational League Rules']),
          JSON.stringify([{ day: 'Grand Finals', date: '2026-08-05', matches: '6 Matches' }]),
          JSON.stringify([
            { rank: 'Champions - Team Soul', amount: '₹ 50,000' },
            { rank: '2nd Place - GodLike Esports', amount: '₹ 25,000' },
            { rank: '3rd Place - Team XSpark', amount: '₹ 15,000' },
            { rank: '4th Place - Global Esports', amount: '₹ 10,000' }
          ])
        ]
      );

      // Seed Standings for Tournament 2 (Ongoing) & 4 (Completed)
      const sampleTeamsT2 = [
        { rank: 1, team: 'GodLike Esports', wwcd: 3, placement: 45, kills: 52, total: 97 },
        { rank: 2, team: 'Team Soul', wwcd: 2, placement: 38, kills: 48, total: 86 },
        { rank: 3, team: 'Team XSpark', wwcd: 2, placement: 35, kills: 41, total: 76 },
        { rank: 4, team: 'Global Esports', wwcd: 1, placement: 30, kills: 38, total: 68 },
        { rank: 5, team: 'Entity Gaming', wwcd: 1, placement: 28, kills: 34, total: 62 },
        { rank: 6, team: 'Reckoning Esports', wwcd: 0, placement: 22, kills: 31, total: 53 },
        { rank: 7, team: 'Carnival Gaming', wwcd: 0, placement: 20, kills: 27, total: 47 },
        { rank: 8, team: 'Orangutan Gaming', wwcd: 0, placement: 18, kills: 24, total: 42 }
      ];

      for (const t of sampleTeamsT2) {
        await run(
          `INSERT INTO standings (tournament_id, rank, team_name, wwcd, placement_pts, kill_pts, total_pts)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [t2.lastID, t.rank, t.team, t.wwcd, t.placement, t.kills, t.total]
        );
      }

      // Seed sample registrations
      const sampleRegistrations = [
        {
          tId: t1.lastID,
          team: 'Toxic Cyber Squad',
          tag: 'TCS',
          cap: 'Aman Sharma',
          phone: '+91 9876543210',
          email: 'aman@cyber.com',
          p1_ign: 'TCS_MortalX', p1_id: '512398471',
          p2_ign: 'TCS_Scouty', p2_id: '512398472',
          p3_ign: 'TCS_Jonathan', p3_id: '512398473',
          p4_ign: 'TCS_Viper', p4_id: '512398474',
          sub_ign: 'TCS_Regaltos', sub_id: '512398475',
          ref: 'UPI/2026/984712039',
          status: 'Approved'
        },
        {
          tId: t1.lastID,
          team: 'Nullified Strikers',
          tag: 'NLS',
          cap: 'Rohan Verma',
          phone: '+91 9812345678',
          email: 'rohan@strikers.in',
          p1_ign: 'NLS_Sniper', p1_id: '588392019',
          p2_ign: 'NLS_Assaulter', p2_id: '588392020',
          p3_ign: 'NLS_IGL', p3_id: '588392021',
          p4_ign: 'NLS_Fragger', p4_id: '588392022',
          sub_ign: '', sub_id: '',
          ref: 'UPI/2026/339201984',
          status: 'Pending'
        },
        {
          tId: t1.lastID,
          team: 'Viper Gaming India',
          tag: 'VGI',
          cap: 'Vikram Singh',
          phone: '+91 9765432109',
          email: 'vikram@vgi.com',
          p1_ign: 'VGI_Predator', p1_id: '599812344',
          p2_ign: 'VGI_Ghost', p2_id: '599812345',
          p3_ign: 'VGI_Phantom', p3_id: '599812346',
          p4_ign: 'VGI_Slayer', p4_id: '599812347',
          sub_ign: 'VGI_Reserve', sub_id: '599812348',
          ref: 'UPI/2026/774910283',
          status: 'Approved'
        }
      ];

      for (const r of sampleRegistrations) {
        await run(
          `INSERT INTO registrations (tournament_id, team_name, team_tag, captain_name, captain_phone, captain_email, player1_ign, player1_id, player2_ign, player2_id, player3_ign, player3_id, player4_ign, player4_id, sub_ign, sub_id, payment_ref, payment_screenshot, logo_url, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            r.tId, r.team, r.tag, r.cap, r.phone, r.email,
            r.p1_ign, r.p1_id, r.p2_ign, r.p2_id, r.p3_ign, r.p3_id, r.p4_ign, r.p4_id, r.sub_ign, r.sub_id,
            r.ref, 'uploads/sample_screenshot.jpg', 'https://api.dicebear.com/7.x/identicon/svg?seed=' + r.team, r.status
          ]
        );
      }

      console.log('Seeded sample BGMI tournaments, standings, and registrations successfully!');
    } else {
      console.log('Database already contains tournaments data.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

seedData().then(() => {
  process.exit(0);
});
