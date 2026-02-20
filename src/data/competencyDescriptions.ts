/**
 * Deutschsprachiges Enrichment für Kompetenzen und Subskills
 * Quellen: Legal 500, Chambers & Partners, JUVE Handbuch, BCG Legal Talent Report 2024,
 *          DIN EN ISO 9001 (Qualitätsmanagement), IAPP (Datenschutz), CCBE (Anwaltsberufsrecht)
 */

export interface SkillDescription {
  /** Wie der Skill in der DB heißt (exakter Match für Lookup) */
  nameKey: string;
  /** Angezeigter Name auf Deutsch */
  labelDE: string;
  /** Was ist der Schwerpunkt dieses Skills? */
  focus: string;
  /** Wo genau wird er gebraucht? */
  usageContext: string;
  /** Warum ist dieser Skill relevant? */
  relevance: string;
  /** Relevante Tools & Ressourcen */
  tools?: string[];
}

// ─── KOMPETENZEN ──────────────────────────────────────────────────────────────

export const competencyDescriptions: SkillDescription[] = [
  // 1. Transaktionale & Rechtliche Expertise
  {
    nameKey: "Legal Analysis",
    labelDE: "Rechtsanalyse",
    focus: "Systematische Prüfung und Bewertung komplexer rechtlicher Sachverhalte im M&A- und Transaktionsrecht – von der Vertragsstruktur bis zur regulatorischen Compliance.",
    usageContext: "Eingesetzt bei Due-Diligence-Prozessen, der Prüfung von Unternehmenskaufverträgen (SPA, SHA), der Analyse von Garantie- und Gewährleistungsklauseln sowie der Beurteilung von Risiken bei grenzüberschreitenden Transaktionen.",
    relevance: "Fehlerhafte Rechtsanalyse kann zu erheblichen Haftungsrisiken, ungültigen Vertragsklauseln oder ungeplanten regulatorischen Verzögerungen führen. Die Qualität dieser Kompetenz entscheidet direkt über die Transaktionssicherheit.",
    tools: ["Lexis+ AI", "JUVE Handbuch", "Beck-online", "Wolters Kluwer / Legios", "Westlaw International"],
  },
  {
    nameKey: "Contract Drafting",
    labelDE: "Vertragsgestaltung",
    focus: "Präzise Formulierung und Strukturierung von Vertragswerken – insbesondere SPA, SHA, NDA, LOI, Earn-Out-Klauseln und Garantiekatalogen im M&A-Kontext.",
    usageContext: "Verhandlung und Erstellung aller vertraglichen Hauptdokumente in Unternehmenstransaktionen, Joint Ventures, Finanzierungsrunden sowie regulatorischen Vereinbarungen.",
    relevance: "Unpräzise Vertragsformulierungen sind einer der häufigsten Auslöser von Folgestreitigkeiten. Exzellentes Drafting minimiert Auslegungsrisiken und schützt die Interessen des Mandanten langfristig.",
    tools: ["ContractPodAi", "Luminance", "DocuSign CLM", "Microsoft Word mit Track Changes", "Kira Systems"],
  },
  {
    nameKey: "M&A Structuring",
    labelDE: "M&A-Strukturierung",
    focus: "Entwicklung der optimalen rechtlichen und steuerlichen Transaktionsstruktur – Share Deal vs. Asset Deal, Holdingstrukturen, Finanzierungsarchitektur und Sicherheitenpakete.",
    usageContext: "Zentral in der Mandatsbearbeitung bei Unternehmensübernahmen, Private-Equity-Transaktionen, Carve-outs und konzerninternen Restrukturierungen.",
    relevance: "Die gewählte Transaktionsstruktur hat unmittelbare Auswirkungen auf Steuerbelastung, Haftungsabgrenzung, Genehmigungserfordernisse und die spätere Integrationseffizienz. Eine falsch gewählte Struktur kann Millionenwerte kosten.",
    tools: ["Drooms (Virtual Data Room)", "Intralinks", "Dealogic", "Bloomberg Terminal", "Mergermarket"],
  },
  // 2. Verhandlungs- & Kommunikationsfähigkeiten
  {
    nameKey: "Client Communication",
    labelDE: "Mandantenkommunikation",
    focus: "Strukturierte, klare und empfängerorientierte Kommunikation mit Mandanten – von der ersten Beratung über Statusupdates bis zur Präsentation von Verhandlungsergebnissen.",
    usageContext: "In jeder Phase eines Mandats: Erstgespräch, laufende Statusberichte, kritische Risikohinweise, Abschlusspräsentationen und Nachbesprechungen. Besonders wichtig bei C-Level-Mandanten ohne juristischen Hintergrund.",
    relevance: "Mandantenzufriedenheit und Mandatstreue hängen in erheblichem Maße von der Kommunikationsqualität ab. Kanzleien, die als reaktiv und klar kommunizierend wahrgenommen werden, verzeichnen signifikant höhere Retention-Raten.",
    tools: ["Microsoft Teams", "Client Portale (HighQ, SharePoint)", "Loom (asynchrone Updates)", "Zoom / WebEx"],
  },
  {
    nameKey: "Commercial Awareness",
    labelDE: "Wirtschaftliches Verständnis",
    focus: "Verständnis der kommerziellen Treiber, Bewertungslogiken und wirtschaftlichen Konsequenzen von Rechtsgestaltungen – über den rein juristischen Blickwinkel hinaus.",
    usageContext: "Unverzichtbar bei der Beratung zu Earn-Out-Strukturen, Kaufpreisanpassungsmechanismen, Garantierahmen und bei der Kommunikation mit Financial Advisors (Investment Banks, M&A-Beratern) auf Augenhöhe.",
    relevance: "Juristen mit starkem Commercial Awareness werden von Mandanten als Trusted Advisor positioniert statt nur als Dokumentenersteller. Das steigert Reputation, Stundensatz und Mandatsgröße.",
    tools: ["Bloomberg Law", "Capital IQ", "PitchBook", "Mergermarket", "EBITDA-Modellierung in Excel"],
  },
  // 5. Leadership & Team Management
  {
    nameKey: "Team Leadership",
    labelDE: "Teamführung",
    focus: "Effektive Führung und Koordination von Transaktionsteams – inklusive Delegation, Qualitätskontrolle, Mentoring von Associates und Management von Fristen und Ressourcen unter Druck.",
    usageContext: "Besonders gefordert in der Projektsteuerung großer Transaktionen mit multiplen Arbeitsgruppen, beim Management von Parallelspuren (DD, Verhandlung, Regulatory) sowie in der Nachwuchsförderung.",
    relevance: "Die Fähigkeit, ein hochperformantes Team zu führen, ist die Grundvoraussetzung für den Aufstieg zur Partnership. Kanzleien mit starker Leadership-Kultur erzielen konsistent bessere Deal-Outcomes und geringere Mitarbeiterfluktuation.",
    tools: ["Microsoft Teams Planner", "Notion", "Monday.com", "Jira (Projektmanagement)", "360-Grad-Feedback-Tools"],
  },
  // 3. Technologie & Digital Intelligence
  {
    nameKey: "Tech / Legal Ops",
    labelDE: "Technologie & Legal Operations",
    focus: "Einsatz und Steuerung von Legal-Tech-Werkzeugen zur Effizienzsteigerung: KI-gestützte Dokumentenanalyse, Vertragsmanagement, virtuelle Datenräume und Workflow-Automatisierung.",
    usageContext: "In der DD-Phase (automatisierte Dokumentenprüfung), im Vertragsmanagement-Lifecycle, bei der Datenraumverwaltung und in der internen Wissensmanagement-Architektur der Kanzlei.",
    relevance: "Legal-Tech-Kompetenz ist kein Differenziator mehr – sie wird zum Hygienefaktor. Kanzleien ohne strukturierten Legal-Ops-Ansatz verlieren Wettbewerbsfähigkeit gegenüber Tech-affinen Mitbewerbern bei preissensiblen Mandaten.",
    tools: ["Luminance AI", "Kira Systems", "Harvey AI", "iManage (DMS)", "Drooms / Intralinks (VDR)", "HighQ", "Docusign"],
  },
  // 7. Projekt- & Prozessmanagement
  {
    nameKey: "Time Management",
    labelDE: "Zeitmanagement & Priorisierung",
    focus: "Strukturierte Planung und Priorisierung von Aufgaben unter konkurrierenden Deadlines – insbesondere bei parallelen Transaktionsmandaten mit unterschiedlichen Closing-Timelines.",
    usageContext: "Täglich gefordert in der Praxis: Mehrere Transaktionen gleichzeitig, kurzfristige Mandantenanfragen, unerwartete Verhandlungsschleifen und regulatorische Fristanforderungen (Kartellbehörden, SEC Filings).",
    relevance: "Schlechtes Zeitmanagement ist die häufigste Ursache für Fehler, Mandantenunzufriedenheit und Burnout in der Transaktionspraxis. Wer priorisieren kann, schützt seine Mandanten und seine eigene Leistungsfähigkeit.",
    tools: ["Outlook / Google Calendar", "Toggl Track (Zeiterfassung)", "Matter-Management-Software (Clio, Aderant)", "Eisenhower-Matrix"],
  },
];

// ─── SUBSKILLS ─────────────────────────────────────────────────────────────────

export const subskillDescriptions: SkillDescription[] = [
  // Contract Analysis & Review
  {
    nameKey: "Contract Analysis & Review",
    labelDE: "Vertragsanalyse & -prüfung",
    focus: "Kritische Durchsicht bestehender Vertragswerke auf rechtliche Risiken, ungünstige Klauseln, Lücken und Optimierungspotenziale.",
    usageContext: "Beim Kauf eines Unternehmens (Vendor DD, Buyer DD), bei der Übernahme von Bestandsmandaten sowie in M&A-Closing-Checklisten.",
    relevance: "Eine übersehene Change-of-Control-Klausel oder ein fehlender MAC-Begriff kann eine gesamte Transaktion gefährden oder den Kaufpreis massiv beeinflussen.",
    tools: ["Kira Systems", "Luminance", "Loio", "ThoughtRiver"],
  },
  {
    nameKey: "Due Diligence Execution",
    labelDE: "Due-Diligence-Durchführung",
    focus: "Strukturierte, vollständige und fristengerechte Prüfung aller rechtlich relevanten Aspekte eines Zielunternehmens in einem virtuellen Datenraum.",
    usageContext: "Kernaufgabe in jeder M&A-Transaktion auf Käufer- und Verkäuferseite – rechtlich, steuerlich, finanziell, technisch und ESG-bezogen.",
    relevance: "Die DD-Qualität bestimmt den Informationsstand des Mandanten beim Kaufpreis- und Garantieverhandlungen. Unvollständige DDs sind die häufigste Ursache für Post-Closing-Streitigkeiten.",
    tools: ["Drooms", "Intralinks", "Ansarada", "Merrill DatasiteOne", "iDeals VDR"],
  },
  {
    nameKey: "Legal & Logical Analysis",
    labelDE: "Juristische & logische Analyse",
    focus: "Strukturierte rechtliche Argumentation und Subsumtion – Sachverhalt, Norm, Auslegung, Ergebnis – auch in unklaren oder neuartigen Rechtsfragen.",
    usageContext: "Grundlage jeder juristischen Tätigkeit: Gutachten, Memos, Verhandlungspositionen und Anträge.",
    relevance: "Präzise juristische Analyse ist das Handwerk des Anwalts. Ohne diese Kompetenz sind alle anderen Skills substanzlos.",
    tools: ["Beck-online", "Juris", "Westlaw", "Lexis+"],
  },
  {
    nameKey: "Critical Thinking & Questioning",
    labelDE: "Kritisches Denken & Hinterfragen",
    focus: "Aktive Skepsis gegenüber Arbeitsergebnissen, Annahmen und Mandantenangaben – systematische Fehlersuche statt unkritischer Übernahme.",
    usageContext: "Bei der Prüfung von Verkäuferaussagen in der DD, beim Review von Gegenentwürfen und bei internen Qualitätssicherungsprozessen.",
    relevance: "Kanzleien haften für übersehene Risiken. Kritisches Denken ist die erste Verteidigungslinie gegen Malpractice-Claims.",
    tools: ["Pre-Mortem-Technik", "Red Team Reviews", "Peer-Review-Prozesse"],
  },
  // Contract Drafting Sub-Skills
  {
    nameKey: "Written Communication & Documentation",
    labelDE: "Schriftliche Kommunikation & Dokumentation",
    focus: "Klar strukturierte, fehlerfreie und mandantengerechte Darstellung rechtlicher Sachverhalte in Memos, Berichten, Transaktionsdokumenten und E-Mails.",
    usageContext: "Täglich: Client-Memos, DD-Berichte, Executive Summaries, Schriftsätze, Anschreiben an Gegenparteien.",
    relevance: "Schlechte Schriftlichkeit ist das häufigste Qualitätsproblem in der Anwaltspraxis und führt direkt zu Mandantenunzufriedenheit und Haftungsrisiken.",
    tools: ["Microsoft Word", "Grammarly (Englisch)", "Duden-Korrektor", "ChatGPT / Harvey AI (Drafting-Unterstützung)"],
  },
  {
    nameKey: "Quality Assurance & Attention to Detail",
    labelDE: "Qualitätssicherung & Sorgfalt",
    focus: "Systematische Prüfung aller Arbeitsergebnisse auf Vollständigkeit, Konsistenz, Rechtschreibung und inhaltliche Richtigkeit vor der Weitergabe.",
    usageContext: "Vor jedem Versand an Mandanten oder Gegenparteien, bei der Freigabe von Signing-Dokumenten und beim Closing-Prozess.",
    relevance: "Ein Tippfehler in einem Kaufpreis oder eine falsche Bezugnahme in einer Garantieklausel kann zu Millionenschäden führen. Sorgfalt ist keine Soft Skill – sie ist Kernkompetenz.",
    tools: ["Checklisten (Closing Checklists)", "Vier-Augen-Prinzip", "CompareDocs (Versionskontrolle)", "DocuSign"],
  },
  {
    nameKey: "Risk Identification & Assessment",
    labelDE: "Risikoidentifikation & -bewertung",
    focus: "Systematisches Aufspüren und Quantifizieren rechtlicher, regulatorischer und vertraglicher Risiken in Transaktionen und Beratungssituationen.",
    usageContext: "In der Legal DD, bei der Gestaltung von Garantie- und Freistellungsklauseln, bei der Beratung zu Vertragsstrafen und bei Regulatory-Clearance-Einschätzungen.",
    relevance: "Mandanten erwarten von ihrer Kanzlei nicht nur die Benennung von Risiken, sondern deren Quantifizierung und Priorisierung. Das ermöglicht informierte Kaufentscheidungen.",
    tools: ["Risk Register Templates", "Monte-Carlo-Simulation (für Kostenrisiken)", "EY Law / Deloitte Legal Risk Frameworks"],
  },
  // M&A Structuring Sub-Skills
  {
    nameKey: "Strategic Deal Structuring",
    labelDE: "Strategische Deal-Strukturierung",
    focus: "Entwicklung der übergeordneten Transaktionsarchitektur unter Berücksichtigung steuerlicher, rechtlicher und kommerzielle Ziele aller Parteien.",
    usageContext: "In der frühen Mandatsphase: LOI-Verhandlung, Term Sheet, Wahl der Holding-Jurisdiktion und Finanzierungsstruktur.",
    relevance: "Die Entscheidung für eine bestimmte Struktur zu Beginn prägt die gesamte Transaktion. Fehler hier sind schwer rückgängig zu machen und teuer.",
    tools: ["Bloomberg Tax", "PwC Tax Structuring Tools", "Deal-Modelle in Excel", "Transaktions-Strukturdiagramme"],
  },
  {
    nameKey: "Transaction Structuring",
    labelDE: "Transaktionsstrukturierung",
    focus: "Konkrete rechtliche Umsetzung der Transaktionsstruktur – Holdingkaskaden, Kapitalerhöhungen, Umwandlungen und gesellschaftsrechtliche Maßnahmen.",
    usageContext: "In der Dokumentationsphase: Gesellschafterbeschlüsse, Registeranmeldungen, Kapitalmaßnahmen, Fusion und Spaltung.",
    relevance: "Fehler in der gesellschaftsrechtlichen Umsetzung können Transaktionen scheitern lassen oder zu Haftung gegenüber dem Mandanten führen.",
    tools: ["DATEV (Gesellschaftsrecht)", "Handelsregister-Portal", "notarielle Software (z.B. eSigReg)", "ERiC / Elster"],
  },
  {
    nameKey: "Financial Analysis & Valuation",
    labelDE: "Finanzanalyse & Unternehmensbewertung",
    focus: "Grundlegendes Verständnis von Bewertungsmethoden (DCF, Multiplikatoren) und Finanzmodellen zur Beurteilung von Kaufpreisfindung und Earn-Out-Strukturen.",
    usageContext: "Bei Kaufpreisverhandlungen, der Prüfung von Bewertungsgutachten, Earn-Out-Definitionen (EBITDA, ARR) und Kaufpreisanpassungsmechanismen.",
    relevance: "Ein Anwalt, der die Bewertungslogik seines Mandanten versteht, kann Vertragsklauseln wesentlich zielgerichteter gestalten und in Verhandlungen stärker argumentieren.",
    tools: ["Excel (Finanzmodelle)", "Capital IQ", "PitchBook", "KPMG/EY Valuationberichte lesen"],
  },
  {
    nameKey: "Creative Problem Solving",
    labelDE: "Kreative Problemlösung",
    focus: "Entwicklung innovativer rechtlicher und struktureller Lösungsansätze für festgefahrene Verhandlungssituationen oder regulatorische Hürden.",
    usageContext: "Bei Dealbreaker-Situationen in Verhandlungen, unerwarteten Regulierungsproblemen (z.B. FDI-Screening, Kartellfreigabe) und neuartigen Vertragskonstellationen.",
    relevance: "Die besten Transaktionsanwälte werden nicht für das Dokumentenschreiben geschätzt, sondern dafür, Deals über Hürden zu bringen, an denen andere scheitern.",
    tools: ["Design-Thinking-Methoden", "Structured Problem Solving (McKinsey-Ansatz)", "Verhandlungspsychologie-Literatur (Harvard PON)"],
  },
  // Client Communication Sub-Skills
  {
    nameKey: "Stakeholder Engagement & Relationship Management",
    labelDE: "Stakeholder-Management & Beziehungspflege",
    focus: "Aufbau, Pflege und strategische Entwicklung von Beziehungen zu Mandanten, Gegenparteien, Behörden und internen Stakeholdern.",
    usageContext: "Im gesamten Mandatsverlauf, besonders aber in der Mandatsakquise, beim Cross-Selling weiterer Kanzleileistungen und bei der Bindung bestehender Schlüsselmandanten.",
    relevance: "Mandatsbeziehungen sind die wertvollste Ressource einer Kanzlei. Anwälte, die Beziehungen langfristig entwickeln, generieren überproportional mehr Umsatz als technisch starke, aber beziehungsschwache Kollegen.",
    tools: ["CRM-Systeme (InterAction, Salesforce)", "LinkedIn", "Kanzlei-Mandantenverwaltungssoftware", "Newsletter-Tools"],
  },
  {
    nameKey: "Oral Presentation & Persuasion",
    labelDE: "Präsentation & Überzeugungskommunikation",
    focus: "Strukturierte, klare und überzeugende mündliche Darstellung rechtlicher und kommerzieller Sachverhalte gegenüber Mandanten, Boards und Verhandlungsparteien.",
    usageContext: "Board Presentations, Pitch-Präsentationen für neue Mandate, Closing Calls, Mediationen und Schlichtungsverhandlungen.",
    relevance: "Die Fähigkeit, im entscheidenden Moment die richtigen Argumente wirkungsvoll zu platzieren, unterscheidet durchschnittliche von exzellenten Transaktionsanwälten.",
    tools: ["PowerPoint / Google Slides", "Miro (Visualisierung)", "Präsentationstraining", "Toastmasters"],
  },
  {
    nameKey: "Empathy & Emotional Intelligence",
    labelDE: "Empathie & emotionale Intelligenz",
    focus: "Verstehen und berücksichtigen der emotionalen Lage, der Interessen und der unausgesprochenen Bedürfnisse von Mandanten und Verhandlungspartnern.",
    usageContext: "Bei Krisengesprächen, schwierigen Verhandlungssituationen, der Übermittlung schlechter Nachrichten und beim Stakeholder-Management auf Vorstandsebene.",
    relevance: "M&A-Transaktionen scheitern häufiger an emotionalen als an rechtlichen Hürden. Anwälte mit hoher emotionaler Intelligenz können Spannungen deeskalieren und Deals retten.",
    tools: ["Aktives Zuhören", "Nonverbale Kommunikation", "Konfliktmanagement-Training"],
  },
  {
    nameKey: "Business Development & Client Focus",
    labelDE: "Geschäftsentwicklung & Mandantenorientierung",
    focus: "Proaktive Entwicklung neuer Geschäftsmöglichkeiten durch Netzwerken, Thought Leadership und das konsequente Ausrichten der Beratung auf den unternehmerischen Erfolg des Mandanten.",
    usageContext: "Pitches, Legal Directories (Chambers, Legal 500), Konferenzauftritte, Fachartikel, Referral-Netzwerke und Cross-Selling interner Kanzleiexpertise.",
    relevance: "Ohne Business Development kein nachhaltiges Kanzleiwachstum. Partner mit starker BD-Kompetenz sichern die langfristige Wettbewerbsfähigkeit der Kanzlei.",
    tools: ["CRM (InterAction)", "LinkedIn Sales Navigator", "Legal Directories Submission Tools", "Eventbrite für Kanzleiveranstaltungen"],
  },
  // Commercial Awareness Sub-Skills
  {
    nameKey: "Business Case & Business Models",
    labelDE: "Geschäftsmodellverständnis",
    focus: "Fähigkeit, das Geschäftsmodell, die Wertschöpfungskette und die strategischen Ziele eines Mandanten bzw. Transaktionszielobjekts zu verstehen und rechtlich zu übersetzen.",
    usageContext: "Bei der Risikopriorisierung in der DD (welche Risiken sind kaufpreisrelevant?), bei der Gestaltung erfolgsabhängiger Kaufpreiskomponenten und bei strategischen Beratungen.",
    relevance: "Ohne Verständnis des Geschäftsmodells kann ein Anwalt die Bedeutung juristischer Risiken nicht korrekt einschätzen – das führt zu falschen Prioritäten und unbefriedigender Beratung.",
    tools: ["Business Model Canvas", "Value Chain Analysis", "Annual Reports lesen", "IBISWorld / Statista"],
  },
  {
    nameKey: "Synergy Identification & Value Creation",
    labelDE: "Synergiepotenziale & Wertschöpfung",
    focus: "Verständnis der strategischen Synergieziele einer Transaktion (Kosten-, Umsatz-, Technologiesynergien) und deren Reflektion in der Vertragsgestaltung.",
    usageContext: "Bei Post-Merger-Integration-Klauseln, Earn-Out-Definitionen auf Basis von Synergiezielen und bei der Beratung zu Integrationsrisiken.",
    relevance: "Anwälte, die die Synergiestrategie ihres Mandanten verstehen, können Vertragsklauseln entwickeln, die diese Ziele aktiv schützen statt nur passiv zu dokumentieren.",
    tools: ["M&A Integration Playbooks", "McKinsey Synergy Analysis Frameworks", "Excel-Synergieertragsmodelle"],
  },
  {
    nameKey: "Financing Understanding",
    labelDE: "Finanzierungsstrukturen",
    focus: "Grundlegendes Verständnis von Akquisitionsfinanzierungen – Leveraged Buyouts (LBO), Mezzanine, Unitranche, Vendor Loans und zugehörigen Sicherheitenpaketen.",
    usageContext: "Bei der Koordination mit Bankrechts-Teams, bei Covenants-Verhandlungen und bei der Abstimmung von Akquisitions- und Finanzierungsdokumentation.",
    relevance: "Transaktionsanwälte ohne Finanzierungsverständnis verlieren an Schnittstellen mit Banken und Finanzierungsberatern die Kontrolle über den Deal-Prozess.",
    tools: ["Loan Market Association (LMA) Dokumentation", "AFME Standards", "Bloomberg Law Finance", "KPMG LBO-Modelle"],
  },
  // Team Leadership Sub-Skills
  {
    nameKey: "Team Leadership & Delegation",
    labelDE: "Teamführung & Delegation",
    focus: "Klare Aufgabenverteilung, transparente Erwartungssetzung und effektives Monitoring der Teamleistung in hochdruckintensiven Transaktionssituationen.",
    usageContext: "Bei der Steuerung von DD-Teams, der Koordination mehrerer Anwaltsebenen (Partner, Senior Associate, Junior Associate) und bei mandatsübergreifender Ressourcenplanung.",
    relevance: "Ineffektive Delegation führt zu Burnout bei Senior-Anwälten, zu unterausgelasteten Juniors und zu schlechterer Mandatsqualität. Gute Delegation ist das Fundament skalierbarer Exzellenz.",
    tools: ["Jira / Asana (Task Management)", "Monday.com", "Teams-Planner", "RACI-Matrix"],
  },
  {
    nameKey: "Employee Coaching & Development",
    labelDE: "Mitarbeiter-Coaching & Entwicklung",
    focus: "Systematische Förderung und Weiterentwicklung von Associates durch konstruktives Feedback, Mentoring und gezielte Kompetenzübertragung.",
    usageContext: "In täglichen Arbeitsbeziehungen, in strukturierten Review-Gesprächen und in der Mandatsvorbereitung durch gezielte Delegation lehrreicher Aufgaben.",
    relevance: "Kanzleien mit starker Coaching-Kultur haben nachweislich bessere Retention-Raten bei Top-Associates und bauen schneller interne Expertise auf – ein direkter Wettbewerbsvorteil.",
    tools: ["360-Grad-Feedback-Tools", "GROW-Coaching-Modell", "Mentoring-Programme", "Leistungsbeurteilungssoftware"],
  },
  {
    nameKey: "Feedback Culture & Performance Management",
    labelDE: "Feedbackkultur & Leistungssteuerung",
    focus: "Aufbau einer offenen, konstruktiven Rückmeldekultur im Team und sachliche Steuerung der Teamleistung durch klare KPIs und regelmäßige Reviews.",
    usageContext: "In der jährlichen Leistungsbeurteilung, in Projekt-Retrospektiven nach Transaktionsabschlüssen und in der täglichen Arbeitsbeziehung.",
    relevance: "Teams ohne Feedbackkultur lernen langsamer, machen mehr Fehler und verlieren Top-Talente, die sich nicht ausreichend entwickelt fühlen.",
    tools: ["Lattice", "15Five", "Workday (HR)", "OKR-Frameworks", "SBI-Feedbackmodell (Situation-Behavior-Impact)"],
  },
  // Tech / Legal Ops Sub-Skills
  {
    nameKey: "Legal Tech Tool Competence",
    labelDE: "Legal-Tech-Werkzeugkompetenz",
    focus: "Praktische Beherrschung der wichtigsten Legal-Tech-Plattformen – DMS, VDR, Contract-Analytics und Matter-Management.",
    usageContext: "Im Kanzleialltag: Dokumentenmanagement, VDR-Administration, automatisierte Vertragsanalyse und elektronische Signatur-Workflows.",
    relevance: "Legal-Tech-Effizienz reduziert Stundenaufwand ohne Qualitätsverlust – das schafft Kapazität für wertschöpfende juristische Tätigkeiten und steigert die Profitabilität.",
    tools: ["iManage", "NetDocuments", "Drooms", "Harvey AI", "Luminance", "DocuSign", "Adobe Sign"],
  },
  {
    nameKey: "AI/ML Applications in Legal",
    labelDE: "KI-Anwendungen im Rechtsbereich",
    focus: "Kompetenter und kritischer Einsatz von KI-gestützten Werkzeugen für Dokumentenanalyse, Recherche, Drafting und Due-Diligence-Automatisierung.",
    usageContext: "In der DD (automatisierte Risikoextraktion), beim Contract Review und bei der KI-gestützten Fallrecherche und Urteilsanalyse.",
    relevance: "KI reduziert die Kosten für wiederkehrende Aufgaben und ermöglicht es, größere Transaktionen mit gleicher Mannschaftsstärke zu bearbeiten. Anwälte ohne KI-Kompetenz werden mittelfristig Kapazitätsprobleme haben.",
    tools: ["Harvey AI", "Luminance", "Kira Systems", "CoCounsel (Thomson Reuters)", "GPT-4 / Claude", "Lex Machina"],
  },
  {
    nameKey: "Data Management & Data Rooms",
    labelDE: "Datenverwaltung & Virtuelle Datenräume",
    focus: "Professionelle Administration und Nutzung virtueller Datenräume – Upload-Struktur, Zugriffsrechte, Q&A-Prozess und Audit-Trail-Management.",
    usageContext: "In jeder M&A-Transaktion auf Verkäuferseite (VDD-Vorbereitung) und Käuferseite (Datenraumanalyse), sowie bei Finanzierungsrunden und Restrukturierungen.",
    relevance: "Ein schlecht strukturierter Datenraum kostet Zeit, schafft Informationsvorteile für die Gegenpartei und kann den Kaufpreis beeinflussen.",
    tools: ["Drooms", "Intralinks", "Merrill DatasiteOne", "Ansarada", "SharePoint (für interne Repositories)"],
  },
  // Time Management Sub-Skills
  {
    nameKey: "Time Management & Prioritization",
    labelDE: "Zeitmanagement & Priorisierung",
    focus: "Strukturierte tägliche Arbeitsplanung, klare Priorisierung nach Dringlichkeit und strategischer Wichtigkeit und effektive Fristensteuerung.",
    usageContext: "Täglich in der parallelen Bearbeitung mehrerer Mandate, bei der Koordination von Closing-Timelines und bei unerwarteten Prioritätsverschiebungen.",
    relevance: "Ohne klares Zeitmanagement entstehen Qualitätsmängel, verpasste Fristen und Anwaltshaftung. Es ist die Grundbedingung professioneller Zuverlässigkeit.",
    tools: ["Outlook-Kalender mit Zeitblöcken", "Toggl Track", "Time Blocking Methode", "Eisenhower-Matrix"],
  },
  {
    nameKey: "Transaction Planning & Milestones",
    labelDE: "Transaktionsplanung & Meilensteine",
    focus: "Erstellung und Pflege detaillierter Projektzeitpläne für komplexe Transaktionen mit klaren Verantwortlichkeiten, Abhängigkeiten und Contingency-Puffern.",
    usageContext: "Zu Mandatsbeginn: Process Letter, Timeline-Koordination mit Mandanten und Beratern; laufend: Milestone-Tracking und proaktives Eskalationsmanagement.",
    relevance: "Transaktionen ohne klare Meilensteinplanung laufen Gefahr, sich unkontrolliert zu verzögern – mit direkten Kosten für Mandanten und Kanzlei.",
    tools: ["Microsoft Project", "Smartsheet", "Notion (Deal Tracking)", "Process Letter Templates"],
  },
  {
    nameKey: "Resource Allocation & Budgeting",
    labelDE: "Ressourcenplanung & Budgetierung",
    focus: "Effiziente Verteilung von Mandats- und Personalressourcen sowie transparente Kostenkommunikation gegenüber dem Mandanten.",
    usageContext: "Bei Mandatsannahme (Staffing-Entscheidung, Fee Estimate), laufend bei Scope Changes und am Mandatsende bei der Abrechnung und Nachkalkulation.",
    relevance: "Kanzleien, die Mandatsbudgets einhalten und Scope Changes proaktiv kommunizieren, genießen höhere Mandantenzufriedenheit und werden für Folgemandate bevorzugt.",
    tools: ["Elite (Zeiterfassung)", "Aderant", "SAP (für größere Kanzleien)", "Excel-Budgetmodelle"],
  },
];

// ─── LOOKUP HELPERS ────────────────────────────────────────────────────────────

/**
 * Sucht eine Beschreibung für eine Kompetenz anhand ihres Namens (case-insensitive, partial match).
 */
export function getCompetencyDescription(name: string): SkillDescription | undefined {
  const normalized = name.trim().toLowerCase();
  return competencyDescriptions.find(
    (d) =>
      normalized === d.nameKey.toLowerCase() ||
      normalized.includes(d.nameKey.toLowerCase()) ||
      d.nameKey.toLowerCase().includes(normalized)
  );
}

/**
 * Sucht eine Beschreibung für einen Subskill anhand seines Namens.
 */
export function getSubskillDescription(name: string): SkillDescription | undefined {
  const normalized = name.trim().toLowerCase();
  return subskillDescriptions.find(
    (d) =>
      normalized === d.nameKey.toLowerCase() ||
      normalized.includes(d.nameKey.toLowerCase()) ||
      d.nameKey.toLowerCase().includes(normalized)
  );
}
