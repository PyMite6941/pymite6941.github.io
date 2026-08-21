/*
 * College Application Tracker — source-of-truth dataset (offline, no APIs).
 *
 * School list = UNIVERSITIES.md "STRATEGY UPDATE — June 2026" (which that
 * document declares authoritative over its own older sections), filtered by
 * Matt's rules of 2026-08-13:
 *   1. ONLY schools with an honors college / honors program.
 *   2. ONLY schools he can realistically be admitted to, where he actually
 *      meets the stated requirements.
 *
 * Honors programs and requirements below were VERIFIED ONLINE on 2026-08-13
 * against each school's own pages. UNIVERSITIES.md is silent on honors for most
 * schools, so do not re-derive this list from that document alone — its silence
 * is not evidence a program is absent.
 *
 * Excluded, and why:
 * - Northeastern, Santa Clara, Carnegie Mellon, Elizabethtown, St. Mary's MD,
 *   Cal Poly Humboldt — Matt ruled these out directly.
 * - MIT — aspiration, not a plan (rule 2).
 * - Virginia Tech — appears nowhere in UNIVERSITIES.md (an earlier session
 *   invented it).
 * - Purdue, Colorado Mines, Rose-Hulman — June 2026 update says drop them
 *   (test-required against a final 1240).
 * - WPI — rule 1. WPI's catalog shows only "Graduation With Distinction /
 *   High Distinction" awarded by GPA; there is no honors college to apply to.
 * - Georgia Tech — rule 2. Test-REQUIRED with no test-optional path; middle-50%
 *   SAT roughly 1370-1550, so a 1250 sits below the 25th percentile.
 * - Missouri S&T — rule 2. The school is an easy admit, but its Honors Academy
 *   requires SAT 1340+ / ACT 29+ with a 3.75 GPA, and a 1250 does not meet it.
 *
 * Only facts actually stated in the research or verified online are hard-coded.
 * Every field NOT given is "" or TODO — the app renders it as TODO and Matt
 * fills it in. Never invent a deadline or a requirement (see CLAUDE.md). The
 * November 1 priority deadlines found for GMU and UMD are recorded in `notes`
 * as text, NOT in the date fields, because the sources state the day without
 * the application-cycle year — Matt confirms the year, then sets the date.
 *
 * TIERS ARE DELIBERATELY LEFT AS TODO. UNIVERSITIES.md ranks these schools
 * reach/target/safety, but this page is publicly crawlable and CLAUDE.md records
 * that Matt removed a public target/reach/dream list precisely because it told
 * each named school how he ranked it. Set tiers in edit mode — that writes to
 * localStorage, stays on Matt's machine, and is never published.
 *
 * version: bump whenever the school list changes. loadState() discards saved
 * state whose version does not match, which is required — old state is keyed by
 * school ids that no longer exist.
 */
window.CollegeTrackerData = {
	version: 5,

	student: {
		name: 'Matt Gresham',
		classYear: 'Class of 2027',
		school: 'International Community School Bangkok (ICS)',
		grad: 'Expected graduation May 2027',
		gpa: '3.73 weighted / 3.54 unweighted',
		sat: 'SAT 1250 superscore (650 M / 600 R&W)',
		appSystem: 'Common App',
	},

	statuses: ['Not started', 'Draft', 'Submitted', 'Under review', 'Decision', 'Decided'],

	tiers: ['Safety', 'Target', 'Reach', 'Lottery'],

	// the six universal materials shown as a checkbox list on every school card
	materialLabels: [
		{ key: 'transcript', label: 'Transcript' },
		{ key: 'counselor', label: 'Counselor LoR' },
		{ key: 'resume', label: 'Résumé' },
		{ key: 'honors', label: 'Honors app' },
		{ key: 'essay', label: 'Essay' },
		{ key: 'fafsa', label: 'FAFSA' },
	],

	schools: [
		{
			id: 'gmu',
			name: 'George Mason University',
			short: 'GMU',
			tier: 'TODO',
			deadlines: { application: '', finaid: '', scholarship: '', deposit: '' },
			portal: { name: 'TODO', url: '', note: '' },
			honors: {
				name: 'GMU Honors College',
				separateApp: 'Yes — supplemental essay (500 words max)',
				deadline: '',
			},
			interview: true,
			hasCSS: false,
			essays: ['Honors College supplemental essay — 500 words max: TODO'],
			notes: 'Cleanest fit on the list: Honors College sets NO minimum GPA and NO required test score — holistic review. Priority deadline November 1 (confirm the 2026 cycle date). One academic teacher recommendation advised. ABET Cybersecurity Engineering BS; DC corridor; SFS-eligible.',
		},
		{
			id: 'umbc',
			name: 'University of Maryland, Baltimore County',
			short: 'UMBC',
			tier: 'TODO',
			deadlines: { application: '', finaid: '', scholarship: '', deposit: '' },
			portal: {
				name: 'myUMBC',
				url: 'https://my.umbc.edu/',
				note: 'myUMBC account - status check and Scholarship Retriever need a campus ID first; portal has a ~2-week processing lag.',
			},
			honors: {
				name: 'UMBC Honors College',
				separateApp: 'Yes — reviewed after UMBC admission',
				deadline: '',
			},
			interview: 'TODO',
			hasCSS: false,
			essays: ['Essay / supplement: TODO'],
			notes: 'Honors College asks a 3.5+ unweighted GPA — the 3.54 unweighted on the August 2026 transcript clears it, but only just. Test-optional, so the 1250 is not a gate (their admitted average has run near 1400, so apply without scores). You hear from Honors only after UMBC admits you. Best-value cyber; Cyber Scholars; SFS-eligible.',
		},
		{
			id: 'drexel',
			name: 'Drexel University',
			short: 'Drexel',
			tier: 'TODO',
			deadlines: { application: '', finaid: '', scholarship: '', deposit: '' },
			portal: {
				name: 'Discover Drexel',
				url: 'TODO',
				note: 'Discover Drexel portal (user ID + PIN). The Pennoni Honors application lives in this same portal.',
			},
			honors: {
				name: 'Pennoni Honors College',
				separateApp: true,
				deadline: '',
			},
			interview: 'TODO',
			hasCSS: false,
			essays: ['Honors supplement (in portal): TODO'],
			notes: 'Pennoni asks a 3.2+ cumulative GPA — a 3.73 cumulative clears it comfortably. NOT automatic: it is a separate application after Drexel admits you. Co-op earnings are the draw; calendar moves quarter to semester in 2027.',
		},
		{
			id: 'rit',
			name: 'Rochester Institute of Technology',
			short: 'RIT',
			tier: 'TODO',
			deadlines: { application: '', finaid: '', scholarship: '', deposit: '' },
			portal: { name: 'TODO', url: '', note: '' },
			honors: {
				name: 'RIT Honors Program',
				separateApp: 'No separate form — flag interest + supplemental essay',
				deadline: '',
			},
			interview: 'TODO',
			hasCSS: false,
			essays: ['Honors supplemental essay: TODO'],
			notes: 'No separate application — indicate Honors interest on the RIT application and submit the supplemental essay. BE REALISTIC: Honors is roughly the top 5-8% of ACCEPTED applicants and under 1% of all applicants, so treat admission to RIT and admission to Honors as two very different odds. CAE-CO/CAE-R/CAE-CD triple designation; mandatory co-op; SFS-eligible.',
		},
		{
			id: 'umd',
			name: 'University of Maryland, College Park',
			short: 'UMD',
			tier: 'TODO',
			deadlines: { application: '', finaid: '', scholarship: '', deposit: '' },
			portal: { name: 'TODO', url: '', note: '' },
			honors: {
				name: 'Honors College — ACES living-learning program',
				separateApp: 'No direct app — must be invited to Honors College first',
				deadline: '',
			},
			interview: 'TODO',
			hasCSS: false,
			essays: ['TODO: supplemental essay prompt'],
			notes: 'There is NO direct application to ACES. You must first be invited to the UMD Honors College, then preference ACES — so the Honors invite is the real gate. Apply by the November 1 priority deadline (confirm the 2026 cycle date). 3.2 GPA minimum to earn the Honors citation once enrolled. SFS-eligible.',
		},
		{
			id: 'msoe',
			name: 'Milwaukee School of Engineering',
			short: 'MSOE',
			tier: 'TODO',
			deadlines: { application: '', finaid: '', scholarship: '', deposit: '' },
			portal: { name: 'TODO', url: '', note: '' },
			honors: {
				name: 'MSOE Honors Program',
				separateApp: 'Invitation to apply, mailed from November',
				deadline: '',
			},
			interview: 'TODO',
			hasCSS: false,
			essays: ['TODO: supplemental essay prompt'],
			notes: 'PROBLEM: the Honors Program asks a 3.8+ UNWEIGHTED high-school GPA, and the August 2026 transcript settles which figure is which — cumulative unweighted is 3.54 (3.73 weighted), so this does NOT meet the stated bar. Admission to MSOE itself is a separate question; just do not count on the Honors Program invitation. Invitations to apply go out starting in November. Rosie supercomputer (NVIDIA GPU cluster); small classes.',
		},
		{
			id: 'clark',
			name: 'Clark University',
			short: 'Clark',
			tier: 'TODO',
			deadlines: { application: '', finaid: '', scholarship: '', deposit: '' },
			portal: { name: 'TODO', url: '', note: '' },
			honors: {
				name: 'The Honors Program (plus departmental honors)',
				separateApp: 'TODO',
				deadline: '',
			},
			interview: 'TODO',
			hasCSS: false,
			essays: ['TODO: supplemental essay prompt'],
			notes: 'Different shape from the others: Clark honors is 4 courses + a senior culminating activity + 3 co-curriculars, and departmental honors is a senior-year research thesis at a 3.4+ GPA — it is NOT a first-year honors college you get invited into. Judge it on that basis. ClarkNOW gives a free 5th-year master’s; WPI cross-registration. BA not BS.',
		},
	],
};
