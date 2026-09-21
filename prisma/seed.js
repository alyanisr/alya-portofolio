let prisma

const date = (value) => new Date(`${value}T00:00:00.000Z`)

async function main() {
  const { PrismaClient, ContentStatus, EmploymentType, ProjectType, AchievementCategory } = await import('@prisma/client')
  const { randomBytes, scrypt: scryptCallback } = await import('node:crypto')
  const { promisify } = await import('node:util')
  const scrypt = promisify(scryptCallback)
  prisma = new PrismaClient()
  if (process.env.ADMIN_PASSWORD) {
    const salt = randomBytes(16).toString('hex')
    const hash = await scrypt(process.env.ADMIN_PASSWORD, salt, 64)
    await prisma.user.upsert({ where: { email: process.env.ADMIN_EMAIL || 'alyanisnst@gmail.com' }, update: { name: process.env.ADMIN_NAME || 'Alya Nisrina', passwordHash: `scrypt$${salt}$${hash.toString('hex')}`, role: 'ADMIN' }, create: { name: process.env.ADMIN_NAME || 'Alya Nisrina', email: process.env.ADMIN_EMAIL || 'alyanisnst@gmail.com', passwordHash: `scrypt$${salt}$${hash.toString('hex')}`, role: 'ADMIN' } })
  }
  await prisma.person.deleteMany()
  await prisma.person.create({ data: {
    name: 'Alya Nisrina', tagline: 'Problem solver',
    headline: 'I solve problems where business meets technology.',
    bio: 'A technology-oriented problem solver who connects business needs with practical technical solutions.',
    philosophy: 'Done is not the goal. Solving the right problem is.',
    email: process.env.ADMIN_EMAIL || 'alyanisnst@gmail.com', location: 'Bandung, Indonesia',
    photoUrl: '/assets/photos/alya-professional-1.jpg',
  }})
  await prisma.education.upsert({ where: { id: 'education-polban' }, update: {}, create: {
    id: 'education-polban', institution: 'Politeknik Negeri Bandung', degree: 'Sarjana Terapan', field: 'Teknik Informatika',
    gpa: 3.56, maxGpa: 4, startDate: date('2023-08-01'), endDate: date('2026-09-01'),
    thesisTitle: 'Permissioned Blockchain-Based Lecturer Portfolio Repository Prototype', achievements: [], sortOrder: 1,
  }})
  const categories = ['Business & Analysis','Software Engineering','Enterprise / ERP','Quality Assurance','IT Service & Operations','Infrastructure & Networking','Delivery & Project','Tools & Collaboration','Technology Exploration']
  for (const [i, name] of categories.entries()) await prisma.skillCategory.upsert({ where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'') }, update: { sortOrder: i + 1 }, create: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''), sortOrder: i + 1 } })
  const skillData = [
    ['Business Analysis','business-analysis','Business & Analysis','CORE'],['Requirements Engineering','requirements-engineering','Business & Analysis','CORE'],['BPMN','bpmn','Business & Analysis','USED'],['BRD','brd','Business & Analysis','USED'],['FRD','frd','Business & Analysis','USED'],['SRS','srs','Business & Analysis','USED'],['Stakeholder Analysis','stakeholder-analysis','Business & Analysis','USED'],['Odoo','odoo','Enterprise / ERP','USED'],['ERP','erp','Enterprise / ERP','USED'],['Quality Assurance','quality-assurance','Quality Assurance','USED'],['UAT','uat','Quality Assurance','USED'],['Kotlin','kotlin','Software Engineering','USED'],['Jetpack Compose','jetpack-compose','Software Engineering','USED'],['MVVM','mvvm','Software Engineering','USED'],['PostgreSQL','postgresql','Software Engineering','USED'],['Blockchain','blockchain','Technology Exploration','USED'],['IT Service','it-service','IT Service & Operations','EXPLORING'],['Network Configuration','network-configuration','Infrastructure & Networking','USED'],['IT Project Management','it-project-management','Delivery & Project','USED']
  ]
  for (const [name, slug, categoryName, maturity] of skillData) { const category = await prisma.skillCategory.findUniqueOrThrow({ where: { name: categoryName } }); await prisma.skill.upsert({ where: { slug }, update: { maturity }, create: { name, slug, categoryId: category.id, maturity } }) }
  const projects = [
    ['Ono Opo','ono-opo',ProjectType.PROFESSIONAL,'A digital platform for preserving Javanese culture.','Business Analysis'],
    ['IMMS','imms',ProjectType.PROFESSIONAL,'Rail transport maintenance process analysis and solution design.','Business Process Analysis'],
    ['TransJakarta Odoo','transjakarta-odoo',ProjectType.ACADEMIC,'Odoo-based procurement, inventory, and employee process solution.','ERP / Functional Analysis'],
    ['Permissioned Blockchain Portfolio Repository','permissioned-blockchain-portfolio-repository',ProjectType.ACADEMIC,'A permissioned blockchain-based lecturer portfolio repository prototype.','System Analysis & Implementation'],
    ['TeamUp','teamup',ProjectType.COMPETITION,'A skill-matching competition team finder.','Product Development'],
  ]
  for (const [title, slug, projectType, overview, role] of projects) await prisma.project.upsert({ where: { slug }, update: { overview, projectType }, create: { title, slug, projectType, overview, myRole: role, status: ContentStatus.PUBLISHED, featured: true, publishedAt: new Date() } })
  const projectDetails = {
    'ono-opo': {
      problem: 'Translate cultural preservation needs into a clear, validated digital product direction.',
      approach: 'Requirements elicitation, business-process analysis, structured documentation, and stakeholder validation.',
      result: 'A documented product direction covering 11 features, more than 100 use cases, 42 functional requirements, 22 business rules, and 4 milestones.',
      metrics: [{ label: 'BRD', value: '49', unit: 'pages' }, { label: 'FRD', value: '120', unit: 'pages' }, { label: 'Features', value: '11' }, { label: 'Use cases', value: '100+', unit: 'mapped' }, { label: 'Functional requirements', value: '42' }, { label: 'Business rules', value: '22' }, { label: 'User stories', value: '35+' }, { label: 'Milestones', value: '4' }, { label: 'Stakeholder validation', value: '100', unit: '%' }],
      skills: ['business-analysis','requirements-engineering','bpmn','brd','frd','srs','stakeholder-analysis'],
      role: 'Business Analysis',
    },
    imms: {
      problem: 'Understand the railway-maintenance process before proposing a system solution.',
      approach: 'As-Is and To-Be process analysis, requirements clarification, and solution design.',
      result: 'A process-analysis and solution-design foundation for railway/rail transport maintenance.',
      skills: ['business-analysis','requirements-engineering','bpmn'], role: 'Business Process Analysis',
    },
    'transjakarta-odoo': {
      problem: 'Model procurement, inventory, and employee processes in an ERP context.',
      approach: 'BPMN 2.0, As-Is/To-Be analysis, business rules, constraints, ERD, use cases, and Odoo functional implementation.',
      result: 'A custom Odoo module grounded in documented process and functional analysis.',
      skills: ['bpmn','odoo','erp','postgresql'], role: 'ERP / Functional Analysis',
    },
    'permissioned-blockchain-portfolio-repository': {
      problem: 'Create a lecturer portfolio repository with controlled integrity and sharing.',
      approach: 'Permissioned blockchain architecture with MultiChain, PostgreSQL, SHA-256, JSON streams, and off-chain files.',
      result: 'A prototype supporting Google login, public links, draft/finalize, and TU accept/reject flows.',
      skills: ['blockchain','postgresql'], role: 'System Analysis & Implementation',
    },
    teamup: {
      problem: 'Help competition participants find teams through skill matching.',
      approach: 'Mobile product development using Kotlin, Jetpack Compose, and MVVM.',
      result: 'TeamUp received Juara 2 Umum Cipta Inovasi Bidang TIK at KMIPN VII 2025 and HAKI 000984870.',
      skills: ['kotlin','jetpack-compose','mvvm'], role: 'Product Development',
    },
  }
  for (const [slug, detail] of Object.entries(projectDetails)) {
    const project = await prisma.project.findUniqueOrThrow({ where: { slug } })
    await prisma.project.update({ where: { id: project.id }, data: { ...detail, skills: undefined, role: undefined } })
    await prisma.projectRole.deleteMany({ where: { projectId: project.id } })
    await prisma.projectRole.create({ data: { projectId: project.id, title: detail.role } })
    for (const skillSlug of detail.skills) {
      const skill = await prisma.skill.findUniqueOrThrow({ where: { slug: skillSlug } })
      await prisma.projectSkill.upsert({ where: { projectId_skillId: { projectId: project.id, skillId: skill.id } }, update: {}, create: { projectId: project.id, skillId: skill.id } })
    }
  }
  const experienceData = { company: 'PT Aman Media Interaktif', role: 'Business Analyst Intern', employmentType: EmploymentType.INTERNSHIP, startDate: date('2025-06-30'), endDate: date('2025-10-24'), summary: 'Business analysis internship involving requirements, process analysis, validation, and QA evidence.', responsibilities: ['Requirements analysis', 'Process analysis', 'Stakeholder interviews', 'As-Is and To-Be analysis', 'Requirements validation', 'Unit, integration, and UAT testing'], impact: 'QA evidence across 6 core modules: 472 unit test cases, 155 integration test cases, and 29 UAT scenarios.', metrics: [{ label: 'Unit test cases', value: '472' }, { label: 'Integration test cases', value: '155' }, { label: 'UAT scenarios', value: '29' }, { label: 'Core modules', value: '6' }], featured: true }
  const experience = await prisma.experience.upsert({ where: { slug: 'pt-aman-media-interaktif' }, update: experienceData, create: { ...experienceData, slug: 'pt-aman-media-interaktif' } })
  for (const slug of ['ono-opo','imms']) { const project = await prisma.project.findUniqueOrThrow({ where: { slug } }); await prisma.experienceProject.upsert({ where: { experienceId_projectId: { experienceId: experience.id, projectId: project.id } }, update: {}, create: { experienceId: experience.id, projectId: project.id } }) }
  await prisma.organization.upsert({ where: { slug: 'himakom-polban' }, update: {}, create: { name: 'HIMAKOM POLBAN', slug: 'himakom-polban', role: 'HR Leadership', startDate: date('2024-01-01'), responsibilities: ['KPI and performance evaluation','One-year data audit','SOP regeneration'], initiatives: ['KPI scoring model'], impact: 'Supported monthly operations for 80+ members across 9 departments.', memberCount: 80, departmentCount: 9 } })
  await prisma.achievement.upsert({ where: { slug: 'kmipn-vii-2025-teamup' }, update: { result: 'Juara 2 Umum', credential: 'HAKI 000984870', featured: true }, create: { title: 'KMIPN VII 2025 — Juara 2 Umum Cipta Inovasi Bidang TIK', slug: 'kmipn-vii-2025-teamup', organization: 'KMIPN VII', category: AchievementCategory.COMPETITION, date: date('2025-01-01'), result: 'Juara 2 Umum', credential: 'HAKI 000984870', featured: true } })
  for (const achievement of [
    { title: 'Mahasiswa Berprestasi POLBAN 2025', slug: 'mahasiswa-berprestasi-polban-2025', organization: 'Politeknik Negeri Bandung', category: AchievementCategory.RECOGNITION, date: date('2025-01-01'), result: 'Mahasiswa Berprestasi POLBAN 2025', featured: true },
    { title: 'Star Energy Geothermal Scholarship', slug: 'star-energy-geothermal-scholarship', organization: 'Star Energy Geothermal', category: AchievementCategory.SCHOLARSHIP, date: date('2025-01-01'), result: 'Star Energy Geothermal Scholarship', featured: true },
  ]) await prisma.achievement.upsert({ where: { slug: achievement.slug }, update: achievement, create: achievement })
  const teamup = await prisma.project.findUniqueOrThrow({ where: { slug: 'teamup' } })
  const kmipn = await prisma.achievement.findUniqueOrThrow({ where: { slug: 'kmipn-vii-2025-teamup' } })
  await prisma.achievementProject.upsert({ where: { achievementId_projectId: { achievementId: kmipn.id, projectId: teamup.id } }, update: {}, create: { achievementId: kmipn.id, projectId: teamup.id } })
  for (const [title, slug, category, why] of [['SAP', 'sap', 'Enterprise / ERP', 'Exploring enterprise systems and functional consulting.' ], ['IoT / Microcontroller', 'iot-microcontroller', 'Technology Exploration', 'Interested in learning how connected physical systems can solve practical problems.' ]]) {
    const skillCategory = await prisma.skillCategory.findUniqueOrThrow({ where: { name: category } })
    const skill = await prisma.skill.upsert({ where: { slug }, update: {}, create: { name: title, slug, categoryId: skillCategory.id, maturity: 'EXPLORING' } })
    await prisma.learningItem.upsert({ where: { slug }, update: { why }, create: { title, slug, category, maturity: 'EXPLORING', why, description: 'Actively exploring through self-directed learning.' } })
    void skill
  }
  await prisma.certification.upsert({ where: { slug: 'toeic-795' }, update: {}, create: { name: 'TOEIC', slug: 'toeic-795', issuer: 'TOEIC', issueDate: date('2025-01-01'), credentialId: '795' } })
  const lenses = [['Business Analysis','business-analysis'],['Software Engineering','software-engineering'],['ERP / Functional','erp-functional'],['QA / Testing','qa-testing'],['IT Service & Operations','it-service-operations'],['IT Project Management','it-project-management'],['General','general']]
  for (const [name, slug] of lenses) await prisma.roleLens.upsert({ where: { slug }, update: {}, create: { name, slug, headline: `Alya through a ${name} lens`, intro: 'One story, prioritized for the evidence most relevant to this role.' } })
  const lensPriorities = {
    'business-analysis': { projects: ['ono-opo', 'imms', 'transjakarta-odoo'], skills: ['business-analysis', 'requirements-engineering', 'bpmn', 'brd', 'frd', 'srs'] },
    'software-engineering': { projects: ['teamup', 'permissioned-blockchain-portfolio-repository', 'transjakarta-odoo'], skills: ['kotlin', 'jetpack-compose', 'mvvm', 'postgresql', 'blockchain'] },
    'erp-functional': { projects: ['transjakarta-odoo', 'ono-opo', 'imms'], skills: ['odoo', 'erp', 'bpmn', 'requirements-engineering'] },
    'qa-testing': { projects: ['ono-opo', 'imms'], skills: ['quality-assurance', 'uat', 'requirements-engineering'] },
    'it-service-operations': { projects: ['transjakarta-odoo', 'imms'], skills: ['it-service', 'network-configuration'] },
    'it-project-management': { projects: ['ono-opo', 'imms', 'teamup'], skills: ['it-project-management', 'stakeholder-analysis', 'business-analysis'] },
    general: { projects: ['ono-opo', 'teamup', 'transjakarta-odoo', 'permissioned-blockchain-portfolio-repository'], skills: ['business-analysis', 'kotlin', 'odoo', 'quality-assurance'] },
  }
  for (const [lensSlug, priorities] of Object.entries(lensPriorities)) {
    const lens = await prisma.roleLens.findUniqueOrThrow({ where: { slug: lensSlug } })
    for (const [priority, projectSlug] of priorities.projects.entries()) { const project = await prisma.project.findUniqueOrThrow({ where: { slug: projectSlug } }); await prisma.roleLensProject.upsert({ where: { lensId_projectId: { lensId: lens.id, projectId: project.id } }, update: { priority }, create: { lensId: lens.id, projectId: project.id, priority, highlight: priority === 0 } }) }
    for (const [priority, skillSlug] of priorities.skills.entries()) { const skill = await prisma.skill.findUniqueOrThrow({ where: { slug: skillSlug } }); await prisma.roleLensSkill.upsert({ where: { lensId_skillId: { lensId: lens.id, skillId: skill.id } }, update: { priority }, create: { lensId: lens.id, skillId: skill.id, priority, highlight: priority === 0 } }) }
    await prisma.roleLensExperience.upsert({ where: { lensId_experienceId: { lensId: lens.id, experienceId: experience.id } }, update: { priority: 0 }, create: { lensId: lens.id, experienceId: experience.id, priority: 0, highlight: true } })
  }
  // These are curated editorial connections, not keyword recommendations. They
  // let the public case studies lead a recruiter to the evidence that matters.
  const onoOpo = await prisma.project.findUniqueOrThrow({ where: { slug: 'ono-opo' } })
  const imms = await prisma.project.findUniqueOrThrow({ where: { slug: 'imms' } })
  const brd = await prisma.skill.findUniqueOrThrow({ where: { slug: 'brd' } })
  const teamupProject = await prisma.project.findUniqueOrThrow({ where: { slug: 'teamup' } })
  await prisma.contentRelation.deleteMany({ where: { sourceType: 'project', sourceId: { in: [onoOpo.id, teamupProject.id] } } })
  await prisma.contentRelation.createMany({ data: [
    { sourceType: 'project', sourceId: onoOpo.id, targetType: 'experience', targetId: experience.id, relationType: 'EVIDENCE_FOR', sortOrder: 1, note: 'The internship context where this requirements work was practiced.' },
    { sourceType: 'project', sourceId: onoOpo.id, targetType: 'project', targetId: imms.id, relationType: 'RELATED_TO', sortOrder: 2, note: 'Another process-analysis case study.' },
    { sourceType: 'project', sourceId: onoOpo.id, targetType: 'skill', targetId: brd.id, relationType: 'SUPPORTS', sortOrder: 3, note: 'A capability supported by documented evidence.' },
    { sourceType: 'project', sourceId: teamupProject.id, targetType: 'achievement', targetId: kmipn.id, relationType: 'EVIDENCE_FOR', sortOrder: 1, note: 'Independent recognition connected to this product work.' },
  ] })
  const featuredProjectIds = (await prisma.project.findMany({ where: { featured: true }, orderBy: { slug: 'asc' }, select: { id: true } })).map(({ id }) => id)
  const featuredLensIds = (await prisma.roleLens.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true } })).map(({ id }) => id)
  const existing = await prisma.homepageConfig.findFirst()
  const data = { heroTagline: 'Hi, I’m Alya.', heroHeadline: 'I solve problems where business meets technology.', heroSubheadline: 'Business analysis, systems, software, and everything in between.', heroCta1Text: 'Explore my work', heroCta1Url: '/work', heroCta2Text: 'Download CV', heroCta2Url: '#cv', featuredProjectIds, featuredLensIds, featuredExperienceIds: [experience.id], featuredAchievementIds: [], featuredSkillIds: [], featuredLearningIds: [] }
  if (existing) await prisma.homepageConfig.update({ where: { id: existing.id }, data }); else await prisma.homepageConfig.create({ data })
}
main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1) })
