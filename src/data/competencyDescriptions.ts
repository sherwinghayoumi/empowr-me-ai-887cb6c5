/**
 * Deutschsprachiges Enrichment für Kompetenzen und Subskills
 * nameKey = EXAKTER Kompetenz-Name aus der Datenbank
 * Quellen: Legal 500, Chambers & Partners, JUVE Handbuch, BCG Legal Talent Report 2024,
 *          EU AI Act (Art. 72 ff.), IAPP (Datenschutz), CCBE, Harvey AI Whitepaper 2025
 */

export interface SkillDescription {
  nameKey: string;
  labelDE: string;
  focus: string;
  usageContext: string;
  relevance: string;
  tools?: string[];
}

// ─── KOMPETENZEN (echte DB-Namen) ─────────────────────────────────────────────

export const competencyDescriptions: SkillDescription[] = [

  // ── Junior Associate ──────────────────────────────────────────────────────────
  {
    nameKey: "Deal Lifecycle Management",
    labelDE: "Transaktionsprozess-Management",
    focus: "Vollständige Koordination aller Phasen einer M&A-Transaktion – von der Signing-Vorbereitung über Bedingungserfüllung (CPs) bis zum Closing.",
    usageContext: "Kernaufgabe in jeder Unternehmenstransaktion: Erstellung und Pflege von Closing-Checklisten, Koordination aller beteiligten Parteien, Überwachung von Fristen und Signing-Mechanismen.",
    relevance: "Ein unkoordinierter Transaktionsprozess führt zu verpassten Fristen, unerfüllten Bedingungen und im schlimmsten Fall zum Scheitern des Deals. Professionelles Lifecycle-Management schützt Mandanteninteressen direkt.",
    tools: ["Litera Transact", "Legatics", "Datasite", "DocuSign", "HighQ Deal Manager"],
  },
  {
    nameKey: "Ancillary Document Drafting",
    labelDE: "Begleitdokumente & Nebenvereinbarungen",
    focus: "Präzise Erstellung und Anpassung aller unterstützenden Transaktionsdokumente – Vorstandsbeschlüsse, Gesellschafterbeschlüsse, Geschäftsführer-Zertifikate und Vollmachten.",
    usageContext: "In der Closing-Phase jeder Transaktion: Formale Dokumente für Handelsregister, Notariate und behördliche Einreichungen sowie gesellschaftsrechtliche Protokolle.",
    relevance: "Fehler in Nebendokumenten können Registrierungen blockieren, Haftpflichtansprüche auslösen oder den Closing-Termin verzögern. Präzision hier ist Non-Verhandlungssache.",
    tools: ["Clarilis", "MS Word (Track Changes)", "Thomson Reuters Drafting Assistant", "eSigReg (notarielle Software)"],
  },
  {
    nameKey: "AI-Assisted Risk Review",
    labelDE: "KI-gestützte Risikoprüfung",
    focus: "Einsatz von KI-Werkzeugen zur automatisierten Prüfung großer Dokumentenmengen im Datenraum auf rechtliche Risiken, gefolgt von menschlicher Validierung und Priorisierung der Ergebnisse.",
    usageContext: "In der Legal Due Diligence: Screening von Hunderten von Verträgen auf Change-of-Control-Klauseln, Kündigungsrechte, Garantieverletzungen und Compliance-Probleme.",
    relevance: "KI reduziert DD-Durchlaufzeiten um bis zu 60%. Gleichzeitig steigen die Anforderungen an die menschliche Validierungskompetenz – 'Hallucination Checking' wird zur Kernaufgabe.",
    tools: ["Harvey AI", "CoCounsel (Thomson Reuters)", "Kira Systems", "Luminance", "Henchman"],
  },
  {
    nameKey: "Data Hygiene & VDR Architecture",
    labelDE: "Datenraumstruktur & Datenqualität",
    focus: "Professioneller Aufbau und Pflege eines virtuellen Datenraums – Taxonomie, Ordnerstruktur, OCR-Qualitätskontrolle, Schwärzungen und Zugriffsrechtemanagement.",
    usageContext: "Auf Verkäuferseite bei der VDD-Vorbereitung sowie auf Käuferseite bei der Datenraumanalyse. Auch relevant für interne Dokumenten-Repositories.",
    relevance: "Ein schlecht strukturierter Datenraum verschlechtert die Verhandlungsposition, kostet Anwaltszeit und kann Informationsrisiken für den Mandanten erzeugen.",
    tools: ["Datasite (Merrill DatasiteOne)", "Intralinks", "Ansarada", "iDeals VDR", "Adobe Acrobat Pro"],
  },
  {
    nameKey: "Structured Legal Memo Writing",
    labelDE: "Strukturiertes juristisches Schreiben",
    focus: "Klare, strukturierte und mandantengerechte Darstellung rechtlicher Analysen in Memos, Executive Summaries und Due-Diligence-Berichten.",
    usageContext: "Täglich: Red Flag Reports, Legal Memos, Risikomatrizen, Verhandlungspositions-Paper und interne Briefings für Partnerebene.",
    relevance: "Die Qualität schriftlicher Kommunikation ist das wichtigste Qualitätssignal für Mandanten ohne juristischen Hintergrund. Schlechtes Schreiben schadet der Mandantenbeziehung nachhaltig.",
    tools: ["Harvey AI (Drafting-Unterstützung)", "Grammarly", "Microsoft Word", "HighQ (Client Portale)"],
  },
  {
    nameKey: "Regulatory Compliance Basics",
    labelDE: "Regulatorische Grundlagen & Compliance",
    focus: "Grundlegendes Verständnis der wichtigsten regulatorischen Anforderungen in M&A-Transaktionen: FDI-Screening, Kartellrecht, DSGVO, Geldwäscheprävention.",
    usageContext: "Als Erste-Linie-Prüfung in jeder Transaktion: Identifikation regulatorischer Clearance-Erfordernisse, Flagging an Spezialisten und Koordination der Einreichungsunterlagen.",
    relevance: "Übersehene Genehmigungserfordernisse können Transaktionen nichtig machen oder zu empfindlichen Bußgeldern führen. Frühes Erkennen schützt Mandanten und Kanzlei.",
    tools: ["EUR-Lex", "Bundeskartellamt-Portal", "KPMG Regulatory Tracker", "Lexis+ Regulatory Compliance"],
  },

  // ── Mid-Level Associate (MLA) ─────────────────────────────────────────────────
  {
    nameKey: "M&A Project Management",
    labelDE: "M&A-Projektsteuerung",
    focus: "Eigenverantwortliche Steuerung komplexer Transaktionsprojekte – inklusive Zeitplanung, Ressourcenkoordination, Meilenstein-Tracking und Eskalationsmanagement.",
    usageContext: "Bei Transaktionen mit mehreren parallelen Arbeitsspuren (Legal DD, Regulatory, Vertragsverhandlung): Koordination interner Teams, Berater und Mandanten.",
    relevance: "Der Unterschied zwischen einem guten und einem hervorragenden Mid-Level Associate liegt oft im Projektmanagement: Wer den Überblick behält, schützt Fristen und vermeidet teure Fehler.",
    tools: ["Legatics", "Litera Transact", "Microsoft Project", "Notion (Deal Tracking)", "Smartsheet"],
  },
  {
    nameKey: "Negotiating Mid-Market Deal Points",
    labelDE: "Verhandlung von Mid-Market-Transaktionspunkten",
    focus: "Eigenständige Verhandlung und Absicherung marktüblicher Vertragskonditionen in SPA, SHA und Nebenvereinbarungen – Garantiepakete, MAC-Klauseln, Earn-Out-Definitionen.",
    usageContext: "In Verhandlungen mit Gegenseite und deren Anwälten auf MLA-Ebene: Vertretung der Mandanteninteressen in strukturierten Verhandlungsrunden.",
    relevance: "Verhandlungskompetenz ist der direkte Hebel auf das Verhandlungsergebnis. Ein MLA, der marktübliche Konditionen kennt und verteidigen kann, erzielt bessere Deal Terms für den Mandanten.",
    tools: ["EDGAR (SEC Filings für Marktvergleiche)", "Praktiker-Kommentare (Mergers & Acquisitions)", "Harvard PON Verhandlungsmethodik"],
  },
  {
    nameKey: "Fee & Scope Discipline",
    labelDE: "Honorar- & Scope-Management",
    focus: "Transparente Kostenkommunikation, proaktives Management von Scope Changes und konsequente Einhaltung vereinbarter Budgets und Leistungsrahmen.",
    usageContext: "Laufend im Mandatsverlauf: Stundentracking, Abweichungsanalyse, rechtzeitige Kommunikation bei Budgetüberschreitung und Nachverhandlung des Scope.",
    relevance: "Mandantenunzufriedenheit durch Überraschungsrechnungen ist einer der häufigsten Kündigungsgründe. Strukturiertes Honorarmanagement sichert die langfristige Mandantenbeziehung.",
    tools: ["Elite 3E (Zeiterfassung)", "Aderant Expert", "Clio (kleinere Kanzleien)", "SAP FI für Großkanzleien"],
  },
  {
    nameKey: "Definitive Agreement Drafting (SPA/APA)",
    labelDE: "Hauptvertragsgestaltung (SPA/APA)",
    focus: "Professionelle Erstellung und Verhandlung der zentralen Transaktionsdokumente: Share Purchase Agreement (SPA), Asset Purchase Agreement (APA), Garantiepakete und Freistellungsregelungen.",
    usageContext: "Kernaufgabe in jeder M&A-Transaktion: Ersterstellung, Review von Gegenentwürfen und iterative Verhandlung aller Hauptvertragsklauseln.",
    relevance: "Das SPA ist das wichtigste Dokument einer M&A-Transaktion. Klausel für Klausel entscheidet es über Haftungsverteilung, Kaufpreissicherheit und Post-Closing-Risiken.",
    tools: ["Clarilis (automatisiertes Drafting)", "Luminance (Contract Review)", "Practical Law (Klauseldatenbank)", "MS Word mit Track Changes"],
  },
  {
    nameKey: "AI Output Validation",
    labelDE: "KI-Output-Validierung",
    focus: "Kritische Prüfung und Qualitätssicherung von KI-generierten Texten, Analysen und Zusammenfassungen auf faktische Richtigkeit, juristische Korrektheit und Vollständigkeit.",
    usageContext: "Bei jeder Nutzung von Harvey AI, CoCounsel oder ähnlichen Werkzeugen: Vor der Weitergabe an Mandanten oder Integration in Vertragsdokumente.",
    relevance: "Gerichte haben bereits Anwälte mit Bußgeldern >100.000 USD belegt, die KI-Halluzinationen ungeprüft in Schriftsätze übernahmen. Validierungskompetenz ist Haftungsschutz.",
    tools: ["Harvey AI", "CoCounsel", "Hallucination-Checklisten", "Cross-Referenz mit Primärquellen (Beck-online, Westlaw)"],
  },
  {
    nameKey: "Commercial Awareness & Financial Literacy",
    labelDE: "Wirtschaftliches Verständnis & Finanzkompetenz",
    focus: "Verständnis von Unternehmens-bewertung, Bewertungsmethodik (DCF, Multiplikatoren), EBITDA-Definitionen und finanziellen Transaktionsstrukturen zur wirkungsvollen rechtlichen Beratung.",
    usageContext: "Bei Kaufpreisverhandlungen, Earn-Out-Definitionen, Locked-Box vs. Completion Accounts und der Kommunikation mit Financial Advisors (M&A-Banker, CFOs).",
    relevance: "Juristisch starke, aber kommerziell schwache Anwälte werden nicht als Trusted Advisor positioniert. Finanzkompetenz ist der Schlüssel zur Partnership-Track-Reputation.",
    tools: ["Capital IQ", "PitchBook", "Bloomberg Terminal", "Excel (DCF-Modelle)", "Mergermarket"],
  },
  {
    nameKey: "Disclosure Schedule Management",
    labelDE: "Disclosure Schedule Management",
    focus: "Strukturierte Erstellung, Prüfung und Verhandlung aller Offenlegungsanhänge zum Unternehmenskaufvertrag – vollständige und strategisch präzise Abgrenzung von Garantieverletzungen.",
    usageContext: "Im SPA-Verhandlungsprozess: Abstimmung mit Mandant zu offenzulegenden Sachverhalten, Verhandlung des Offenlegungsstandards und Integration in die Garantiehaftungsstruktur.",
    relevance: "Unvollständige oder schlecht strukturierte Disclosure Schedules sind die häufigste Ursache für Post-Closing-Streitigkeiten. Sorgfalt hier schützt den Verkäufer direkt.",
    tools: ["Kira Systems (automatische Datenpunktextraktion)", "Excel (Schedule-Tracking)", "Datasite", "Praktiker-Kommentare zu Unternehmenskauf"],
  },
  {
    nameKey: "Data Room & Closing Automation",
    labelDE: "Datenraum- & Closing-Automatisierung",
    focus: "Einsatz von Automatisierungstools zur Optimierung des Datenraum-Managements und des Closing-Prozesses – automatisierte Dokumentenindizierung, digitale Signing-Workflows und Closing-Checklisten-Tools.",
    usageContext: "In der Closing-Phase: Koordination von digitalen Signing-Ceremonies, automatisiertes Monitoring von Bedingungserfüllungen und Datenraum-Archivierung.",
    relevance: "VDR-Automatisierung hat bis Q2 2026 bereits 90% des Marktanteils erreicht. Anwälte, die manuelle Prozesse bevorzugen, verlieren gegenüber automatisierenden Wettbewerbern deutlich an Effizienz.",
    tools: ["Litera Transact", "Legatics", "DocuSign", "Datasite Automate", "HighQ"],
  },
  {
    nameKey: "Stakeholder Management & Difficult Counterparties",
    labelDE: "Stakeholder-Management & schwierige Gegenparteien",
    focus: "Professionelle Steuerung komplexer Interessenlagen mehrerer Parteien – Mandant, Gegenpartei, Behörden, Finanzierungspartner – auch in eskalierenden oder blockierten Verhandlungssituationen.",
    usageContext: "In Mehrparteien-Transaktionen, bei Auktionsprozessen, bei der Koordination von Gesellschafterkreisen und bei Verhandlungen mit staatlichen Stellen (FDI, Kartell).",
    relevance: "Die Fähigkeit, schwierige Verhandlungsdynamiken zu entschärfen und Coalitions of Consent zu bilden, rettet Deals – und ist der entscheidende Unterschied zwischen Closing und Scheitern.",
    tools: ["Harvard PON Verhandlungsmethodik", "Interest-Based Negotiation", "Mediationstechniken"],
  },
  {
    nameKey: "EU AI Act & Digital Compliance",
    labelDE: "EU AI Act & digitale Compliance",
    focus: "Umfassendes Verständnis des EU AI Acts (VO 2024/1689) – Risikokategorisierung von KI-Systemen, Verbote, Anforderungen an Hochrisiko-KI, Konformitätsbewertung und behördliche Aufsicht (BNetzA als Marktüberwachungsbehörde).",
    usageContext: "In M&A-Transaktionen: Due-Diligence-Prüfung KI-nutzender Zielunternehmen, Vertragsgestaltung für KI-Systeme, Beratung zur Compliance-Umsetzung vor dem August-2026-Stichtag.",
    relevance: "Die allgemeine Anwendbarkeit des EU AI Acts am 02. August 2026 schafft harte Compliance-Fristen. Nicht-konforme KI-Systeme sind M&A-Dealbreaker. Bußgelder bis 35 Mio. EUR oder 7% des weltweiten Jahresumsatzes.",
    tools: ["EUR-Lex (EU AI Act Volltext)", "ALTAI (Assessment List for Trustworthy AI)", "BNetzA-Portal", "Linklaters AI Act Navigator"],
  },
  {
    nameKey: "Junior Associate & Paralegal Supervision",
    labelDE: "Supervision von Junior Associates & Paralegals",
    focus: "Strukturierte Aufgabendelegation, Qualitätskontrolle und Entwicklungsunterstützung für Junior-Anwälte und Paralegals innerhalb von Transaktionsteams.",
    usageContext: "In jeder Transaktion, bei der MLA/SA-Ebene Junior-Ressourcen leitet: Aufgabenverteilung, Briefing, Review der Arbeitsprodukte und konstruktives Feedback.",
    relevance: "Effektive Supervision multipliziert die Output-Qualität des Teams und ist eine Voraussetzung für den Aufstieg zur Senior-Associate- bzw. Counselebene.",
    tools: ["RACI-Matrix", "Briefing-Templates", "360-Grad-Feedback-Systeme", "Microsoft Teams (Aufgabentracking)"],
  },
  {
    nameKey: "AI-Ready VDR Architecture",
    labelDE: "KI-optimierte Datenraumarchitektur",
    focus: "Konzeption und Implementierung von Datenraumstrukturen, die speziell auf KI-gestützte Dokumentenanalyse ausgelegt sind – strukturierte Metadaten, konsistente Taxonomien und maschinenlesbare Formate.",
    usageContext: "Beim Aufbau von Verkäufer-Datenräumen und bei der Koordination mit KI-DD-Tools. Besonders relevant bei datenintensiven Targets (Tech-Unternehmen, Fintech, Healthcare).",
    relevance: "KI-Tools liefern bessere Analyseergebnisse bei strukturierten Datenräumen. Anwälte, die KI-taugliche Datenräume aufbauen, beschleunigen den DD-Prozess messbar.",
    tools: ["Datasite Automate", "Ansarada AI", "Kira Systems", "Luminance", "iDeals VDR"],
  },
  {
    nameKey: "Regulatory Clearance Coordination (FDI / Antitrust)",
    labelDE: "Koordination regulatorischer Freigaben (FDI / Kartellrecht)",
    focus: "Eigenständige Koordination aller Freigabeprozesse in M&A-Transaktionen: Fusionskontrolle (EU-Kommission, Bundeskartellamt), FDI-Screening (AWG/AWV in Deutschland, CFIUS in den USA, NSI Act in UK).",
    usageContext: "In grenzüberschreitenden Transaktionen mit Marktpräsenz in EU, USA oder UK: Vorbereitung der Anmeldungen, Koordination mit Behörden und Management der Standstill-Obligations.",
    relevance: "Regulatorische Clearances können Transaktionen um 3-12 Monate verzögern oder ganz verhindern. Frühzeitige und professionelle Koordination ist entscheidend für die Termintreue.",
    tools: ["Bundeskartellamt-Portal", "EU Commission DG COMP", "KPMG FDI Screening Tool", "Lexis+ Regulatory Compliance"],
  },

  // ── Senior Associate / Counsel ────────────────────────────────────────────────
  {
    nameKey: "Sanctions, Export Controls & Trade Compliance",
    labelDE: "Sanktionen, Exportkontrolle & Handels-Compliance",
    focus: "Umfassende Beratung zu internationalem Sanktionsrecht (EU, OFAC/US, UN), Exportkontrollrecht (EG-Dual-Use-VO, ITAR, EAR) und Handels-Compliance in M&A-Transaktionen.",
    usageContext: "In grenzüberschreitenden Transaktionen: Sanktionsscreening von Zielunternehmen, Gesellschaftern und Geschäftspartnern; Exportkontrollprüfung bei Tech-Assets und Verteidigungsgütern.",
    relevance: "Sanktionsverletzungen können zur Nichtigkeit von Transaktionen führen und strafrechtliche Folgen haben. Seit 2022 hat die Komplexität des Sanktionsrechts erheblich zugenommen.",
    tools: ["Refinitiv World-Check", "Dow Jones Risk & Compliance", "OFAC SDN List Checker", "EU Sanctions Map"],
  },
  {
    nameKey: "FDI Screening & National Security Review",
    labelDE: "FDI-Screening & Nationale Sicherheitsprüfung",
    focus: "Beratung und Koordination bei der Prüfung ausländischer Direktinvestitionen durch nationale Sicherheitsbehörden – Deutschland (AWV §55 ff.), EU-Screening-VO 2019/452, UK NSI Act, US CFIUS.",
    usageContext: "Bei Transaktionen mit strategisch relevanten Targets (Infrastruktur, Rüstung, Halbleiter, Energie, Gesundheit): Vorabprüfung der Screening-Pflicht und Koordination der Anmeldung.",
    relevance: "FDI-Prüfungen können Transaktionen auf Anordnung der Bundesregierung verbieten oder mit Auflagen versehen. Die Zahl der Prüfverfahren in Deutschland hat sich seit 2020 mehr als verdreifacht.",
    tools: ["BAFA-Portal (Deutschland)", "CFIUS-Anmeldungssystem (US)", "Investment Security Unit (UK)", "EU Cooperation Mechanism"],
  },
  {
    nameKey: "Delegation, Coaching & Feedback Loops",
    labelDE: "Delegation, Coaching & Feedbackschleifen",
    focus: "Systematische Entwicklung von Junior-Anwälten durch gezielte Delegation, konstruktives Feedback und die Etablierung regelmäßiger Lernschleifen im Transaktionsbetrieb.",
    usageContext: "Im Tagesgeschäft: Briefing von Associates, Review mit Entwicklungsfeedback (nicht nur Fehlerkorrektur), Mentoring-Gespräche und Leistungsbeurteilungen.",
    relevance: "Kanzleien mit starker Coaching-Kultur haben 35% niedrigere Associate-Fluktuation. Senior Associates, die gut coachen, gelten als Partner-Material.",
    tools: ["GROW-Coaching-Modell", "SBI-Feedback-Methode (Situation-Behavior-Impact)", "Lattice", "15Five"],
  },
  {
    nameKey: "Resource Planning & Utilization Management",
    labelDE: "Ressourcenplanung & Auslastungssteuerung",
    focus: "Strategische Planung und Steuerung des Personaleinsatzes – Auslastungsoptimierung, Konfliktvermeidung bei parallelen Mandaten und vorausschauende Kapazitätsplanung.",
    usageContext: "Bei der Mandatsannahme, bei Closing-Peaks und bei der Koordination von Urlaubszeiten und Abwesenheiten im Transaktionsbetrieb.",
    relevance: "Überlastung ist die häufigste Ursache für Fehler in Hochdruckphasen. Gutes Ressourcenmanagement schützt sowohl die Mandatsqualität als auch das Wohlbefinden des Teams.",
    tools: ["Staffing-Software (Intapp Workload)", "Tableau (Auslastungs-Dashboards)", "Microsoft Planner", "Excel-Kapazitätsmodelle"],
  },
  {
    nameKey: "Executive Risk Summarization & Recommendation",
    labelDE: "Risikoaufbereitung & Handlungsempfehlung für C-Level",
    focus: "Kondensierung komplexer rechtlicher Risikoanalysen in prägnante, entscheidungsreife Zusammenfassungen für Vorstände, Investment Committees und Managing Partners.",
    usageContext: "Am Ende jeder DD-Phase, bei kritischen Verhandlungspunkten und beim finalen Closing-Briefing: 1-Seiten-Risikomatrix, Executive Summary und Entscheidungsvorlage.",
    relevance: "C-Level-Entscheidungsträger haben keine Zeit für juristische Details. Die Fähigkeit, rechtliche Komplexität in klare Handlungsempfehlungen zu übersetzen, ist der entscheidende Wertbeitrag.",
    tools: ["PowerPoint (Risikomatrix-Templates)", "Miro (Visualisierung)", "HighQ (Client-Portale)", "Harvey AI (Summary-Generierung)"],
  },
  {
    nameKey: "Client Relationship Management (Delivery-Led)",
    labelDE: "Mandantenbeziehungsmanagement (lieferungsbasiert)",
    focus: "Aufbau und Vertiefung langfristiger Mandantenbeziehungen durch exzellente Mandatserfüllung, proaktive Kommunikation und das konsequente Antizipieren von Mandantenbedürfnissen.",
    usageContext: "Im gesamten Mandatsverlauf: Regelmäßige Status-Updates, Vorbereitung auf kritische Phasen, Cross-Selling und gezielter Aufbau von Vertrauen als Trusted Advisor.",
    relevance: "Mandantenbindung ist profitabler als Mandantenakquise. Senior Associates, die Mandantenbeziehungen eigenständig pflegen, qualifizieren sich für die Partnership-Track.",
    tools: ["CRM (InterAction, Salesforce)", "Microsoft Teams (Client Channels)", "HighQ Deal Portale", "Loom (asynchrone Video-Updates)"],
  },
  {
    nameKey: "Ancillary Documents & Corporate Housekeeping (Senior-Level)",
    labelDE: "Gesellschaftsrechtliche Dokumentation (Senior-Level)",
    focus: "Eigenverantwortliche Gestaltung und Überwachung der gesellschaftsrechtlichen Transaktionsdokumentation – Umwandlungen, Kapitalmaßnahmen, Registeranmeldungen und Post-Closing-Strukturanpassungen.",
    usageContext: "In komplexen Transaktionsstrukturen mit mehreren Jurisdiktionen: Koordination notarieller Urkunden, Kapitalerhöhungen, Fusionen, Spaltungen und gesellschaftsrechtlicher Sondermaßnahmen.",
    relevance: "Fehler in der gesellschaftsrechtlichen Umsetzung können Transaktionen nichtig machen oder erhebliche Folgekosten verursachen. Senior-Level-Sorgfalt ist hier unverzichtbar.",
    tools: ["Handelsregister-Portal (ERiC)", "DATEV Gesellschaftsrecht", "notarielle Software", "XBRL-Reporting-Tools"],
  },
  {
    nameKey: "Legal Project Coordination (Cross-Border)",
    labelDE: "Rechtsprojekt-Koordination (grenzüberschreitend)",
    focus: "Koordination von Anwaltsteams und lokalen Counsels in mehreren Jurisdiktionen zur einheitlichen, fristgerechten Bearbeitung grenzüberschreitender Transaktionen.",
    usageContext: "Bei internationalen M&A-Transaktionen: Abstimmung mit Local Counsels in EU, UK, USA und emerging markets; Harmonisierung der DD-Ergebnisse und Schnittstellen-Management.",
    relevance: "Grenzüberschreitende Transaktionen erfordern juristische Koordination ohne Qualitätsverlust über Zeitzonen und Rechtssysteme hinweg. Koordinationsschwäche ist einer der häufigsten Ursachen für Verzögerungen.",
    tools: ["Microsoft Teams (International)", "Legalign Global Alliance", "Lex Mundi (Netzwerk-Koordination)", "Drooms (globale VDRs)"],
  },

  // ── Agentic AI / Neue Kompetenzen ─────────────────────────────────────────────
  {
    nameKey: "Agentic AI Governance (operational)",
    labelDE: "Agentic-AI-Governance (operativ)",
    focus: "Operative Umsetzung von Governance-Strukturen für KI-Agenten-Systeme im Kanzleibetrieb – Aufsichtskonzepte, Validierungsprotokolle, Human-in-the-Loop-Design und Haftungszuweisung.",
    usageContext: "Bei der Einführung und dem Betrieb von KI-Agenten-Systemen (Harvey, CoCounsel) in Kanzleien: Erstellen von Nutzungsrichtlinien, Überwachungsprotokollen und Eskalationsmechanismen.",
    relevance: "Ab Q2 2026 sind 70%+ der Legal-Tech-Plattformen mit nativen Agentic-AI-Funktionen ausgestattet. Wer keine Governance hat, riskiert Haftungsexponierung. Nachfrage: 80-120 Punkte (SA/Partner).",
    tools: ["EU AI Act Art. 72 ff.", "ALTAI-Framework", "ISO/IEC 42001 (KI-Management)", "Kanzlei-eigene AI Policy Templates"],
  },

  // ── Partner ───────────────────────────────────────────────────────────────────
  {
    nameKey: "Business Origination & Client Development",
    labelDE: "Mandatsakquise & Geschäftsentwicklung",
    focus: "Systematische Entwicklung neuer Mandate und Mandantenbeziehungen durch Netzwerkaufbau, Thought Leadership, Legal Directories und gezielte Cross-Selling-Strategien.",
    usageContext: "Dauerhaft: Pitches, Chambers & Legal 500 Submissions, Konferenzauftritte, Webinare, Fachartikel und gezielte Pflege von Referral-Netzwerken (Investmentbanken, PE-Fonds, M&A-Berater).",
    relevance: "Partner ohne Origination-Kompetenz sind langfristig nicht als Equity-Partner haltbar. Business Development bestimmt die Wettbewerbsfähigkeit der Kanzlei.",
    tools: ["InterAction CRM", "LinkedIn Sales Navigator", "Chambers Submission Tools", "Eventbrite (Veranstaltungen)", "Hubbard One"],
  },
  {
    nameKey: "Strategic Deal Leadership",
    labelDE: "Strategische Deal-Führung",
    focus: "Übergeordnete Führung komplexer Transaktionen: Strategieentwicklung, Verhandlungsführung auf Entscheidungsebene, Management kritischer Eskalationen und Sicherstellung des Mandatserfolgs.",
    usageContext: "In der gesamten Transaktionsführung auf Partner-Ebene: Vom LOI bis zum Post-Closing, inklusive Mandantenstrategie-Beratung und Verhandlungsführung gegenüber C-Level-Vertretern der Gegenpartei.",
    relevance: "Partner sind die Anker jeder großen Transaktion. Ihre Fähigkeit, Entscheidungen unter Druck zu treffen und Teams zu führen, ist der entscheidende Qualitätsfaktor.",
    tools: ["Harvard PON Verhandlungsführung", "McKinsey Problem-Solving Framework", "Deal Dashboards (HighQ)"],
  },
  {
    nameKey: "Agentic AI Governance (strategic)",
    labelDE: "Agentic-AI-Governance (strategisch)",
    focus: "Strategische Positionierung der Kanzlei im Umgang mit KI-Agenten – Aufbau einer belastbaren AI-Governance-Strategie, Regulierungsmonitoring und Kommunikation gegenüber Mandanten und Behörden.",
    usageContext: "Auf Partner-Ebene: Entwicklung der kanzleiweiten KI-Strategie, Antwort auf Mandanten-RFPs zu AI Governance, Verhandlung von KI-Klauseln in Mandatsvereinbarungen und Zertifizierungsinitiativen.",
    relevance: "In-House-Counsel sind ab Q2 2026 die primäre Durchsetzungsebene für KI-Governance in Kanzleien. Kanzleien ohne glaubwürdige Governance-Narrative verlieren Mandate.",
    tools: ["ISO/IEC 42001", "EU AI Act (Art. 6-51)", "ALTAI-Framework", "Big-4-AI-Governance-Toolkits"],
  },
  {
    nameKey: "Privacy Architecture & Cross-Jurisdictional Data",
    labelDE: "Datenschutz-Architektur & jurisdiktionsübergreifende Daten",
    focus: "Gestaltung komplexer Datenschutz-Compliance-Strukturen für grenzüberschreitende Transaktionen – DSGVO, US-Bundesstaatliche Datenschutzgesetze (CCPA, Indiana, Rhode Island), UK GDPR und branchenspezifische Regelungen.",
    usageContext: "In internationalen M&A-Transaktionen: Datenschutz-DD, Beratung zu Datenübertragungsvereinbarungen (SCCs), Bewertung von Datenschutzexposure und Gestaltung Post-Merger-Datenschutzprogramme.",
    relevance: "Ab 2026 gelten 20+ US-Bundesstaatliche Datenschutzgesetze. Cross-jurisdiktionale Compliance ist einer der komplexesten Bestandteile moderner M&A-Transaktionen.",
    tools: ["OneTrust", "TrustArc", "IAPP Datenschutz-Ressourcen", "Linklaters Data Protection Tracker"],
  },
];

// ─── SUBSKILLS ─────────────────────────────────────────────────────────────────

export const subskillDescriptions: SkillDescription[] = [
  // Deal Lifecycle Management
  {
    nameKey: "CP Tracking",
    labelDE: "Bedingungserfüllungs-Tracking",
    focus: "Lückenlose Überwachung aller aufschiebenden Bedingungen (Conditions Precedent) – wer ist verantwortlich, welcher Status, welche Frist.",
    usageContext: "In jeder Transaktion zwischen Signing und Closing: Erstellung und Pflege der CP-Checkliste mit tagesaktuellem Status.",
    relevance: "Eine unerfüllte CP, die erst am Closing-Tag auffällt, kann Transaktionen scheitern lassen. Professionelles CP-Tracking ist essenziell.",
    tools: ["Legatics", "Litera Transact", "Excel-Closing-Checklisten"],
  },
  {
    nameKey: "Signature Coordination",
    labelDE: "Signing-Koordination",
    focus: "Organisation und Durchführung von Signing-Ceremonies: physisch, hybrid oder volldigital – inklusive Vollmachten, Unterschriftenreihenfolge und Rückdatierungsmanagement.",
    usageContext: "In der Signing-Phase: Koordination mit Notaren, Mandanten, Gegenparteien und deren Anwälten über Zeitzonen hinweg.",
    relevance: "Ein Signing-Fehler (falsche Unterzeichner, fehlende Vollmacht) kann zu einem unwirksamen Vertrag führen – mit enormen Folgekosten.",
    tools: ["DocuSign", "Adobe Sign", "VerSign (EU-qualifizierte Signatur)", "Legatics"],
  },
  {
    nameKey: "VDR Management",
    labelDE: "Virtuelle-Datenraum-Verwaltung",
    focus: "Professionelle Administration eines virtuellen Datenraums – Upload-Struktur, Zugriffsrechte nach Partei und Vertraulichkeitsstufe, Q&A-Prozess-Steuerung und Audit-Trail.",
    usageContext: "In der DD-Phase: tägliche Verwaltung des Datenraums, Bearbeitung von Dokumentenanfragen und laufende Zugangskontrolle.",
    relevance: "Ein gut verwalteter Datenraum beschleunigt die DD und minimiert Informationsrisiken. Ein schlecht verwalteter gibt der Gegenpartei unbeabsichtigte Informationsvorteile.",
    tools: ["Datasite", "Intralinks", "Ansarada", "iDeals VDR", "Drooms"],
  },
  {
    nameKey: "Closing Mechanics",
    labelDE: "Closing-Mechanik",
    focus: "Technische Durchführung des Closings: simultane Vertragsunterzeichnung, Kaufpreisüberweisung, Treuhänder-Freigabe und notarielle Vollzugsbeurkundung.",
    usageContext: "Am Closing-Tag: Koordination aller Parteien, Bestätigung der Kaufpreiszahlung, Freigabe von Datenräumen und Versand der Closing-Bestätigung.",
    relevance: "Das Closing ist der kritischste Tag einer Transaktion. Jeder Fehler in der Mechanik hat unmittelbare finanzielle und rechtliche Konsequenzen.",
    tools: ["Litera Transact", "DocuSign", "Swift (Zahlungsbestätigung)", "Notarielle Software"],
  },

  // Ancillary Document Drafting
  {
    nameKey: "Template Adaptation",
    labelDE: "Template-Anpassung",
    focus: "Effiziente und präzise Anpassung standardisierter Dokumentenvorlagen an die spezifischen Anforderungen einer Transaktion ohne Verlust rechtlicher Genauigkeit.",
    usageContext: "Bei der Erstellung von Nebenvereinbarungen, Resolutionen und Protokollen unter Zeitdruck.",
    relevance: "Blinde Template-Nutzung ohne sorgfältige Anpassung ist eine der häufigsten Fehlerquellen bei Begleitdokumenten.",
    tools: ["Clarilis", "HotDocs", "MS Word mit Makros", "Practical Law (Vorlagen)"],
  },
  {
    nameKey: "Corporate Governance",
    labelDE: "Gesellschaftsrechtliche Governance",
    focus: "Kenntnisse der gesellschaftsrechtlichen Anforderungen für Beschlüsse, Protokolle und Vollmachten in verschiedenen Rechtsformen (GmbH, AG, SE) und Jurisdiktionen.",
    usageContext: "Bei der Erstellung von Gesellschafterbeschlüssen, Aufsichtsratsbeschlüssen und Geschäftsführerbestellungen im Rahmen von Transaktionen.",
    relevance: "Formelle Mängel in Gesellschafterbeschlüssen können zu Anfechtbarkeit führen. Korrekte Governance-Dokumentation ist Grundvoraussetzung.",
    tools: ["DATEV Gesellschaftsrecht", "Handelsregister-Portal", "Gesellschaftsrechts-Kommentare (Scholz, Münchener)"],
  },
  {
    nameKey: "Error-spotting",
    labelDE: "Fehleridentifikation",
    focus: "Systematische Durchsicht von Dokumenten auf inkonsistente Bezugnahmen, falsche Zahlen, fehlende Definitionen und logische Widersprüche.",
    usageContext: "Bei jedem Dokumentenreview vor Weitergabe an Mandanten oder Gegenparteien.",
    relevance: "Ein Zahlendreher in einem Kaufpreis oder eine fehlerhafte Klausel kann zu Millionenschäden führen. Fehleridentifikation ist Kernhandwerk.",
    tools: ["CompareDocs (Versionskontrolle)", "Checklisten", "Vier-Augen-Prinzip"],
  },
  {
    nameKey: "Cross-referencing",
    labelDE: "Querverweismanagement",
    focus: "Präzise Pflege aller internen und externen Querverweise in Vertragswerken – Definitionen, Anlagen und andere Verträge.",
    usageContext: "In komplexen Vertragswerken mit multiplen Anlagen und Nebenabreden: Sicherstellung konsistenter Bezugnahmen.",
    relevance: "Inkonsistente Querverweise sind eine häufige Streitquelle nach Closing. Sorgfältige Querverweiskontrolle verhindert Auslegungsstreitigkeiten.",
    tools: ["MS Word (Feldfunktionen)", "Litera Compare", "ContractPodAi"],
  },

  // AI-Assisted Risk Review
  {
    nameKey: "Prompt Engineering",
    labelDE: "Prompt-Engineering",
    focus: "Effektive Formulierung von Anweisungen für KI-Systeme, um präzise und verwendbare Outputs für juristische Aufgaben zu erhalten.",
    usageContext: "Bei der Nutzung von Harvey AI, CoCounsel oder GPT-4 für DD-Analysen, Vertragszusammenfassungen und Risikobewertungen.",
    relevance: "Gutes Prompt Engineering maximiert die Qualität des KI-Outputs. Nachfrage sinkt ab 2026 (von 80 auf 20-30 Punkte) da Agentic AI Einzelprompts automatisiert.",
    tools: ["Harvey AI", "CoCounsel", "Claude", "GPT-4o", "Prompt-Engineering-Guides (OpenAI)"],
  },
  {
    nameKey: "Hallucination Checking",
    labelDE: "KI-Halluzinations-Prüfung",
    focus: "Systematische Verifikation von KI-generierten Aussagen, Zitaten und Rechtsreferenzen gegen verlässliche Primärquellen.",
    usageContext: "Nach jeder KI-gestützten Recherche oder Dokumentenerstellung: Abgleich von Urteils-Zitaten, Gesetzesreferenzen und Faktaussagen.",
    relevance: "Halluzinationsraten sinken bis Q2 2026 auf ~4-5%, aber 'confident hallucinations' werden schwerer erkennbar. Gerichte haben bereits Anwälte mit Bußgeldern >100.000 USD belegt.",
    tools: ["Beck-online", "Westlaw", "Juris", "Lexis+ (Primärquellen-Verifizierung)"],
  },
  {
    nameKey: "Risk Grading",
    labelDE: "Risikobewertung & -priorisierung",
    focus: "Systematische Klassifizierung identifizierter Risiken nach Eintrittswahrscheinlichkeit und finanzieller Auswirkung in einer klaren Risikomatrix.",
    usageContext: "Im Red Flag Report: Priorisierung der wichtigsten DD-Findings für die Entscheidung des Mandanten zu Kaufpreis und Vertragsgestaltung.",
    relevance: "Ohne klare Risikoproritisierung sind DD-Berichte für Entscheidungsträger nicht handlungsreif. Risiko-Grading übersetzt juristische Analysen in unternehmerische Entscheidungsgrundlagen.",
    tools: ["Risikomatrix-Templates", "EY Law Risk Framework", "Excel-Bewertungstools"],
  },
  {
    nameKey: "Synthesis",
    labelDE: "Synthese & Zusammenfassung",
    focus: "Kondensierung umfangreicher Analyseergebnisse in prägnante, gut strukturierte Zusammenfassungen für verschiedene Zielgruppen (Partner, Mandant, Board).",
    usageContext: "Am Ende der DD-Phase, bei Verhandlungs-Briefings und bei Executive Summaries.",
    relevance: "Die Fähigkeit zur Synthese unterscheidet erfahrene Anwälte von Anfängern: Nicht die Menge der Informationen, sondern deren Verdichtung schafft Wert.",
    tools: ["Harvey AI (Summary-Generierung)", "PowerPoint", "Miro", "HighQ"],
  },

  // Data Hygiene & VDR Architecture
  {
    nameKey: "Taxonomy Design",
    labelDE: "Taxonomie-Design",
    focus: "Entwicklung einer logischen, vollständigen und benutzerfreundlichen Ordnerstruktur für virtuelle Datenräume, die sowohl rechtliche als auch KI-Analyse-Anforderungen erfüllt.",
    usageContext: "Zu Beginn eines Verkaufsprozesses: Strukturierung des VDR nach Due-Diligence-Kategorien (Legal, Financial, Tax, HR, IP, Regulatory).",
    relevance: "Eine schlechte Taxonomie verlängert den DD-Prozess und führt zu unnötigen Nachfragen. Eine gute Taxonomie beschleunigt die Analyse um bis zu 40%.",
    tools: ["Datasite (Template-Strukturen)", "Ansarada AI (automatische Indexierung)", "Excel-Taxonomie-Mapping"],
  },
  {
    nameKey: "OCR QC",
    labelDE: "OCR-Qualitätskontrolle",
    focus: "Überprüfung und Korrektur der optischen Zeichenerkennung (OCR) von gescannten Dokumenten, um maschinenlesbare und durchsuchbare Dokumentenqualität sicherzustellen.",
    usageContext: "Bei der VDR-Befüllung: QC aller gescannten Dokumente vor Upload, insbesondere bei alten Verträgen, handschriftlichen Dokumenten und schlechter Scan-Qualität.",
    relevance: "KI-Analysetools und Keyword-Suchen funktionieren nur bei korrekt erkannten Texten. Schlechte OCR-Qualität macht KI-DD-Tools unbrauchbar.",
    tools: ["Adobe Acrobat Pro (OCR)", "ABBYY FineReader", "Kofax", "Datasite OCR-Prüfung"],
  },
  {
    nameKey: "File Naming",
    labelDE: "Datei-Benennung & -Strukturierung",
    focus: "Konsistente und beschreibende Benennung aller Dateien im Datenraum nach definierten Konventionen für einfache Navigation und KI-Analyse.",
    usageContext: "Bei der VDR-Befüllung und -Pflege: Umbenennung von Dokumenten nach Transaktions-Konventionen.",
    relevance: "Inkonsistente Dateinamen verlangsamen die Analyse und können zu Dokumentenverwechslungen führen.",
    tools: ["Datenraum-Naming-Konventionen", "Batch-Umbenennungstools", "Ansarada AI (automatische Benennung)"],
  },
  {
    nameKey: "Redaction",
    labelDE: "Schwärzung & Vertraulichkeitsmanagement",
    focus: "Professionelle Schwärzung vertraulicher Informationen in Dokumenten – personenbezogene Daten, Preise, strategische Informationen – vor Freigabe an Dritte.",
    usageContext: "In der DD-Phase auf Verkäuferseite: Schwärzung von DSGVO-relevanten Daten, wettbewerbssensitiven Informationen und Syndizierungsklauseln.",
    relevance: "Fehlerhafte Schwärzungen können zu DSGVO-Verstößen, Informationslecks und Verhandlungsnachteilen führen.",
    tools: ["Adobe Acrobat Pro (Schwärzung)", "Litera Redact", "Datenraum-Schwärzungsfunktionen"],
  },

  // AI Output Validation / EU AI Act
  {
    nameKey: "Validation Protocols",
    labelDE: "Validierungsprotokolle",
    focus: "Entwicklung und Anwendung standardisierter Prüfverfahren zur Qualitätssicherung von KI-Outputs vor ihrer Verwendung in Rechtsdokumenten oder Mandantenberatungen.",
    usageContext: "Bei jeder Integration von KI-generierten Inhalten in Vertragsentwürfe, Memos oder Behördeneingaben.",
    relevance: "Strukturierte Validierungsprotokolle schützen vor Haftung und sichern gleichzeitig die Qualität der KI-Nutzung. Sie sind Grundlage einer belastbaren AI-Governance.",
    tools: ["Checklisten-Templates", "Vier-Augen-Review", "Kommentarannotations-Tools"],
  },
  {
    nameKey: "Agentic Workflow Design",
    labelDE: "Agentic-Workflow-Design",
    focus: "Konzeption und Implementierung mehrstufiger KI-Agenten-Workflows für juristische Aufgaben – Delegation von Teilaufgaben an spezialisierte KI-Agenten mit menschlicher Überwachung.",
    usageContext: "Bei der Einführung von Agentic-AI-Systemen in DD-Prozesse, Vertragsreview und Compliance-Monitoring.",
    relevance: "Bis Q2 2026 setzen 70%+ der Legal-Tech-Plattformen native Agentic-AI ein. Anwälte, die Agentic Workflows designen können, werden zu strategischen Multiplikatoren.",
    tools: ["Harvey Agents", "CoCounsel Multi-Agent", "Legaltech Hub Agentic AI Index"],
  },

  // Weitere häufige Subskills
  {
    nameKey: "Due Diligence Execution",
    labelDE: "Due-Diligence-Durchführung",
    focus: "Strukturierte, vollständige und fristgerechte Prüfung aller rechtlich relevanten Aspekte eines Zielunternehmens.",
    usageContext: "Kernaufgabe in jeder M&A-Transaktion: Legal, Financial, Tax, HR, IP und Regulatory DD.",
    relevance: "Die DD-Qualität bestimmt den Informationsstand bei Kaufpreis- und Garantieverhandlungen. Unvollständige DDs sind die häufigste Ursache für Post-Closing-Streitigkeiten.",
    tools: ["Drooms", "Intralinks", "Ansarada", "Merrill DatasiteOne"],
  },
  {
    nameKey: "Risk Identification & Assessment",
    labelDE: "Risikoidentifikation & -bewertung",
    focus: "Systematisches Aufspüren und Quantifizieren rechtlicher, regulatorischer und vertraglicher Risiken.",
    usageContext: "In der Legal DD, bei Garantiegestaltung und bei Regulatory-Clearance-Einschätzungen.",
    relevance: "Mandanten erwarten Risikoproritisierung, nicht nur Risikonennung. Qualitative und quantitative Bewertung ermöglicht informierte Kaufentscheidungen.",
    tools: ["Risikomatrix-Templates", "Monte-Carlo-Simulation", "EY Law Risk Frameworks"],
  },
  {
    nameKey: "Financial Analysis & Valuation",
    labelDE: "Finanzanalyse & Unternehmensbewertung",
    focus: "Grundlegendes Verständnis von DCF, Multiplikatoren und EBITDA-Definitionen für wirkungsvolle Vertragsgestaltung.",
    usageContext: "Bei Kaufpreisverhandlungen, Earn-Out-Definitionen und Locked-Box-Mechanismen.",
    relevance: "Juristen mit Bewertungsverständnis können Vertragsklauseln wesentlich zielgerichteter gestalten und stärker argumentieren.",
    tools: ["Excel (Finanzmodelle)", "Capital IQ", "PitchBook", "Bloomberg"],
  },
];

// ─── LOOKUP HELPERS ────────────────────────────────────────────────────────────

/**
 * Sucht eine Beschreibung für eine Kompetenz anhand des exakten DB-Namens.
 * Primär: exakter Match. Fallback: Teilstring-Match (case-insensitive).
 */
export function getCompetencyDescription(name: string): SkillDescription | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();

  // 1. Exakter Match
  const exact = competencyDescriptions.find(
    (d) => d.nameKey.toLowerCase() === normalized
  );
  if (exact) return exact;

  // 2. Teilstring-Match (DB-Name enthält Key oder umgekehrt)
  return competencyDescriptions.find(
    (d) =>
      normalized.includes(d.nameKey.toLowerCase()) ||
      d.nameKey.toLowerCase().includes(normalized)
  );
}

/**
 * Sucht eine Beschreibung für einen Subskill anhand des Namens.
 */
export function getSubskillDescription(name: string): SkillDescription | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();

  const exact = subskillDescriptions.find(
    (d) => d.nameKey.toLowerCase() === normalized
  );
  if (exact) return exact;

  return subskillDescriptions.find(
    (d) =>
      normalized.includes(d.nameKey.toLowerCase()) ||
      d.nameKey.toLowerCase().includes(normalized)
  );
}
