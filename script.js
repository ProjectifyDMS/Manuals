const STORAGE_KEY = "om-manual-builder-draft-v2";
const LEGACY_STORAGE_KEY = "om-manual-builder-draft-v1";
const PROJECT_DATABASE_KEY = "om-manual-builder-project-database-v1";
const KEY_SEPARATOR = "||";
let storageAvailable = true;
let selectedSiteDetailPath = {
  site: "",
  structure: "",
  level: "",
  space: "",
};
let selectedServiceClassification = "";

const projectFieldNames = ["projectName", "clientName", "siteAddress", "preparedBy", "revision", "handoverDate", "projectSummary", "projectImage"];
const sectionFieldNames = [
  "introduction",
  "scopeOfWorks",
  "operatingInstructions",
  "technicalData",
  "commissioningSummary",
  "safetyRequirements",
  "emergencyProcedures",
  "spareParts",
];

const assetHeaders = [
  "Asset ID",
  "Parent Asset ID",
  "Description",
  "Service Name",
  "Subservice",
  "Site Name",
  "Structure Name",
  "Level Name",
  "Space Name",
  "Location Description",
  "Make",
  "Model",
  "Serial Number",
  "Supplier",
  "Quantity",
  "Retail Price $",
  "Install Date",
  "Wty Expiry Date",
  "Life Expectancy (yrs)",
  "Reference Information",
  "Updated Date",
  "Updated User",
];

const unitOptions = ["Hours", "Days", "Months", "Years"];

const defaultServiceClassifications = [
  ["Electrical Services", "Lighting"],
  ["Electrical Services", "Emergency Lighting"],
  ["Electrical Services", "General Power"],
  ["Electrical Services", "Switchboards"],
  ["Mechanical Services", "Air Handling"],
  ["Mechanical Services", "Ventilation"],
  ["Mechanical Services", "Controls"],
  ["Fire Protection Services", "Wet Fire"],
  ["Fire Protection Services", "Dry Fire"],
  ["Hydraulic Services", "Domestic Cold Water"],
  ["Hydraulic Services", "Domestic Hot Water"],
  ["Hydraulic Services", "Sanitary Plumbing"],
  ["Security Services", "Access Control"],
  ["Communications Services", "Structured Cabling"],
  ["Vertical Transport", "Lifts"],
  ["FF&E", "Furniture"],
];

const sectionDefaults = {
  fields: {
    introduction: "",
    scopeOfWorks: "",
    operatingInstructions: "",
    technicalData: "",
    commissioningSummary: "",
    safetyRequirements: "",
    emergencyProcedures: "",
    spareParts: "",
  },
  contacts: [],
  equipment: [],
  maintenance: [],
  commissioning: [],
  warranties: [],
  certificates: [],
  asBuilts: [],
  documents: [],
};

const defaults = {
  fields: {
    projectName: "",
    clientName: "",
    siteAddress: "",
    preparedBy: "",
    revision: "",
    handoverDate: "",
    projectImage: "",
  },
  siteDetails: [],
  serviceClassifications: cloneData(defaultServiceClassifications),
  selectedFolder: {
    discipline: "Mechanical",
    trade: "HVAC",
    subTrade: "Air Handling Units",
  },
  folders: {},
};

const sampleFolderData = {
  fields: {
    projectSummary:
      "This manual covers the operation and maintenance requirements for the installed air handling units, controls, dampers, and associated electrical works serving the North Wing.",
    introduction:
      "This Operations and Maintenance manual provides the information required to operate, maintain, inspect, and support the installed works after handover.",
    scopeOfWorks:
      "The scope includes the air handling units, associated controls, dampers, variable speed drives, filters, access requirements, maintenance tasks, warranties, commissioning records, certificates, and as-built references.",
    operatingInstructions:
      "Operate the plant through the building management system under the approved time schedule. Use local isolators only for maintenance, emergency shutdown, or authorised testing.",
    technicalData:
      "Design supply air temperature: 14 degrees C. Normal occupied schedule: 7:00 am to 6:00 pm weekdays. Filter replacement threshold: manufacturer recommended final pressure drop.",
    commissioningSummary:
      "Commissioning was completed after installation, balancing, controls verification, alarm testing, and client witness review. Open defects are to be tracked in the handover register.",
    safetyRequirements:
      "Only trained personnel are to access plant areas. Isolate electrical supplies before servicing. Use lockout/tagout for all rotating equipment. Wear eye protection, gloves, and hearing protection where required.",
    emergencyProcedures:
      "In an emergency, stop the affected plant from the local isolator or building management system, notify the facility manager, and contact the nominated service contractor before restart.",
    spareParts:
      "AHU filters: 12 sets, size 592 x 592 x 95 mm. Drive belts: 2 sets per fan assembly. Temperature sensors: 4 spare units.",
  },
  contacts: [
    ["Example Facilities", "Mechanical Services", "100 Sample Street, Sydney NSW", "+61 2 5550 1000", "jordan@example.com", "https://example.com"],
    ["Atlas Building Services", "Air Handling", "22 Service Road, Sydney NSW", "+61 2 5550 2000", "service@atlas.example", "https://atlas.example"],
  ],
  equipment: [
    [
      "AHU-01",
      "",
      "Air handling unit",
      "Mechanical",
      "HVAC",
      "North Wing",
      "Main Building",
      "Level 5",
      "Plant Room",
      "Level 5 plant room",
      "",
      "Airstream",
      "AS-2500",
      "AS2500-1044",
      "Airstream",
      "1",
      "",
      "2026-04-15",
      "2028-05-03",
      "15",
      "Manufacturer manual and commissioning record",
      "2026-05-04",
      "Atlas Building Services",
    ],
    [
      "VSD-01",
      "AHU-01",
      "Supply fan variable speed drive",
      "Mechanical",
      "HVAC",
      "North Wing",
      "Main Building",
      "Level 5",
      "AHU-01 control panel",
      "AHU-01 control panel",
      "",
      "Danfoss",
      "FC102",
      "FC102-8871",
      "Danfoss",
      "1",
      "",
      "2026-04-15",
      "2028-05-03",
      "10",
      "VSD datasheet",
      "2026-05-04",
      "Atlas Building Services",
    ],
  ],
  maintenance: [
    ["AHU-01", "1", "Months", "Inspect filters and replace when pressure drop exceeds limit. Record pressure readings in service log."],
    ["VSD-01", "3", "Months", "Verify sensors, dampers, and BMS alarms. Calibrate sensors outside tolerance."],
  ],
  commissioning: [["AHU-01", "Airflow and controls functional test", "2026-04-22", "Passed", "Client witness sheet C-01"]],
  warranties: [["AHU-01", "Airstream", "2026-05-04", "2028-05-03", "Parts and labour subject to quarterly maintenance records.", "AHU warranty certificate.pdf"]],
  certificates: [["Electrical compliance", "EC-2026-041", "Licensed Electrical Contractor", "2026-04-20", "Included in handover pack.", "Electrical compliance certificate.pdf"]],
  asBuilts: [["Mechanical services as-built drawings", "Rev AB", "2026-04-28", "MS-100 to MS-115", "Final issue for handover."]],
  documents: [
    ["Drawing", "Mechanical services as-built drawings", "MS-100 to MS-115", "Issued at handover"],
    ["Warranty", "AHU manufacturer warranty", "Appendix W1", "Keep proof of commissioning with warranty file"],
  ],
};

const sampleData = {
  fields: {
    projectName: "North Wing HVAC Upgrade",
    clientName: "Example Facilities Group",
    siteAddress: "100 Sample Street, Sydney NSW",
    preparedBy: "Atlas Building Services",
    revision: "01",
    handoverDate: "2026-05-04",
  },
  selectedFolder: {
    discipline: "Mechanical",
    trade: "HVAC",
    subTrade: "Air Handling Units",
  },
  folders: {},
};

function sampleAssetRow({
  id,
  parent = "",
  description,
  service,
  subservice,
  site = "Main Building",
  level = "Level 1",
  space = "Plant / Service Area",
  location,
  make,
  model,
  serial,
  supplier,
  quantity = "1",
  retailPrice = "",
  installDate = "2026-04-15",
  warrantyExpiry = "2028-05-03",
  life = "15",
  reference,
}) {
  return [
    id,
    parent,
    description,
    service,
    subservice,
    "Sample Site",
    site,
    level,
    space,
    location,
    make,
    model,
    serial,
    supplier,
    quantity,
    retailPrice,
    installDate,
    warrantyExpiry,
    life,
    reference,
    "2026-05-04",
    supplier,
  ];
}

function buildSampleFolder({ discipline, trade = "", subTrade = "", assets, supplier, technicalData, spareParts }) {
  const title = [discipline, trade, subTrade].filter(Boolean).join(" / ");
  const primaryAsset = assets[0];
  return {
    folder: { discipline, trade, subTrade },
    data: {
      fields: {
        introduction: `This section provides the operation and maintenance information for the ${title} scope installed at the sample site.`,
        scopeOfWorks: `The scope includes supply, installation, testing, commissioning, warranty support, spare parts information, safety requirements, and document references for ${title}.`,
        operatingInstructions: `Operate the ${title} systems in accordance with the installed controls, manufacturer recommendations, and site operating procedures. Isolate equipment before servicing.`,
        technicalData,
        commissioningSummary: `${title} commissioning was completed using functional checks, visual inspection, controls verification, and client witness review where applicable.`,
        safetyRequirements: `Only authorised personnel are to operate or maintain ${title} systems. Follow site induction, isolation procedures, access requirements, and relevant safety data before work starts.`,
        emergencyProcedures: `In an emergency, make the affected ${title} system safe, notify the facility manager, isolate supplies where required, and contact the nominated service provider before restart.`,
        spareParts,
      },
      contacts: [
        [`${supplier} Pty Ltd`, trade || discipline, "22 Service Road, Sydney NSW", "+61 2 5550 2000", `service@${slug(supplier)}.example`, `https://${slug(supplier)}.example`],
        ["Example Facilities", discipline, "100 Sample Street, Sydney NSW", "+61 2 5550 1000", "facilities@example.com", "https://example.com"],
      ],
      equipment: assets,
      maintenance: assets.map((asset, index) => [
        asset[0],
        index === 0 ? "1" : "6",
        "Months",
        `Inspect ${asset[2].toLowerCase()}, check condition, clean accessible components, confirm operation, and record findings in the maintenance log.`,
      ]),
      commissioning: [[primaryAsset[0], `${primaryAsset[2]} functional test`, "2026-04-22", "Passed", "Client witness record"]],
      warranties: [[primaryAsset[0], supplier, "2026-05-04", "2028-05-03", "Warranty subject to scheduled maintenance and correct operation.", `${primaryAsset[0]} warranty.pdf`]],
      certificates: [["Completion certificate", `${slug(discipline).toUpperCase()}-CERT-001`, supplier, "2026-04-24", "Included in sample handover pack.", `${discipline} certificate.pdf`]],
      asBuilts: [[`${title} as-built drawings`, "Rev AB", "2026-04-28", `${slug(discipline).toUpperCase()}-100 series`, "Final issue for handover."]],
      documents: [
        ["Manual", `${primaryAsset[2]} manufacturer manual`, `${primaryAsset[0]}-MAN-001`, "Supplier operation and maintenance manual."],
        ["Datasheet", `${title} datasheet`, `${slug(discipline).toUpperCase()}-DS-001`, "Product data and technical reference."],
      ],
    },
  };
}

function buildSampleManualData() {
  const next = cloneData(sampleData);
  next.fields = {
    projectName: "Sample Multi-Discipline O&M Manual",
    clientName: "Example Facilities Group",
    siteAddress: "100 Sample Street, Sydney NSW",
    preparedBy: "Atlas Building Services",
    revision: "01",
    handoverDate: "2026-05-04",
    projectImage: "assets/sample-project-image.png",
    projectSummary:
      "This sample Operations and Maintenance manual demonstrates a multi-discipline handover pack covering electrical lighting, mechanical HVAC air handling units, wet fire services, hydraulics, and FF&E. It includes representative asset data, contacts, maintenance requirements, commissioning records, warranties, certificates, as-built references, safety information, and document registers for PDF generation testing.",
  };
  next.siteDetails = [
    ["Sample Site", "Main Building", "Ground Floor", "Fire Pump Room", "Dedicated wet fire services plant room."],
    ["Sample Site", "Main Building", "Ground Floor", "Hydraulic Plant Room", "Domestic hot water plant and hydraulic services equipment."],
    ["Sample Site", "Main Building", "Level 1", "Open Office", "General office workspace and workstation area."],
    ["Sample Site", "Main Building", "Level 1", "Corridor", "Primary circulation corridor with emergency lighting and fire hose reel access."],
    ["Sample Site", "Main Building", "Level 5", "Plant Room", "Mechanical plantroom serving the north wing."],
    ["Sample Site", "Main Building", "Amenities", "Riser Cupboard", "Hydraulic riser cupboard adjacent amenities."],
  ];
  next.serviceClassifications = cloneData(defaultServiceClassifications);
  next.selectedFolder = { discipline: "Electrical", trade: "Lighting", subTrade: "" };
  next.folders = {};

  [
    buildSampleFolder({
      discipline: "Electrical",
      trade: "Lighting",
      assets: [
        sampleAssetRow({ id: "LTG-01", description: "LED panel luminaire", service: "Electrical Services", subservice: "Lighting", level: "Level 1", space: "Open Office", location: "Ceiling grid throughout Level 1 open office.", make: "Pierlite", model: "Aether LED 600", serial: "PL600-BATCH01", supplier: "Brightline Electrical", quantity: "36", retailPrice: "185", life: "10", reference: "Lighting layout, luminaire schedule, and AS/NZS 3000 installation records" }),
        sampleAssetRow({ id: "EML-01", description: "Emergency luminaire", service: "Electrical Services", subservice: "Emergency Lighting", level: "Level 1", space: "Corridor", location: "Corridor exits and fire stair approaches.", make: "Stanilite", model: "Spitfire LED", serial: "SFLED-BATCH02", supplier: "Brightline Electrical", quantity: "14", retailPrice: "245", life: "8", reference: "Emergency lighting test schedule to AS/NZS 2293" }),
      ],
      supplier: "Brightline Electrical",
      technicalData: "Lighting circuits are 230 V AC and installed to AS/NZS 3000. Emergency lighting is documented for routine inspection and discharge testing to AS/NZS 2293.",
      spareParts: "Spare LED drivers: 6. Emergency luminaire batteries: 8. Diffusers and mounting clips: assorted set.",
    }),
    buildSampleFolder({
      discipline: "Mechanical",
      trade: "HVAC",
      subTrade: "Air Handling Units",
      assets: [
        sampleAssetRow({ id: "AHU-01", description: "Air handling unit", service: "Mechanical Services", subservice: "Air Handling", site: "Main Building", level: "Level 5", space: "Plant Room", location: "Level 5 mechanical plantroom serving the north wing.", make: "Temperzone", model: "OPA-2500", serial: "TZ-AHU-2500-01", supplier: "Atlas Mechanical", quantity: "1", retailPrice: "42500", life: "15", reference: "Mechanical services drawings and AHU technical manual" }),
        sampleAssetRow({ id: "VSD-01", parent: "AHU-01", description: "Supply fan variable speed drive", service: "Mechanical Services", subservice: "Controls", site: "Main Building", level: "Level 5", space: "Plant Room", location: "Mounted in AHU-01 local control panel.", make: "Danfoss", model: "VLT HVAC Drive FC102", serial: "FC102-8871", supplier: "Atlas Mechanical", quantity: "1", retailPrice: "3850", warrantyExpiry: "2028-05-03", life: "10", reference: "VSD datasheet and controls commissioning record" }),
      ],
      supplier: "Atlas Mechanical",
      technicalData: "Air handling equipment is operated through the BMS with maintenance access requirements documented to NCC and WHS expectations. Hygiene and inspection tasks reference AS/NZS 3666 where applicable.",
      spareParts: "AHU filters: 12 sets, size 592 x 592 x 95 mm. Drive belts: 2 sets per fan assembly. Temperature sensors: 4 spare units.",
    }),
    buildSampleFolder({
      discipline: "Fire Services",
      trade: "Wet Fire",
      assets: [
        sampleAssetRow({ id: "FHR-01", description: "Fire hose reel", service: "Fire Protection Services", subservice: "Wet Fire", level: "Level 1", space: "Corridor", location: "Level 1 corridor adjacent fire stair entry.", make: "FlameStop", model: "36 m FHR cabinet", serial: "FHR-BATCH03", supplier: "Redline Fire", quantity: "3", retailPrice: "980", life: "20", reference: "Wet fire services drawings and AS 1851 maintenance schedule" }),
        sampleAssetRow({ id: "SPR-01", description: "Sprinkler control valve set", service: "Fire Protection Services", subservice: "Wet Fire", level: "Ground Floor", space: "Fire Pump Room", location: "Ground floor fire pump room valve assembly.", make: "Tyco", model: "CVS-150", serial: "CVS150-5510", supplier: "Redline Fire", quantity: "1", retailPrice: "12800", life: "25", reference: "Sprinkler valve commissioning sheet and AS 2118.1 design records" }),
      ],
      supplier: "Redline Fire",
      technicalData: "Wet fire systems include fire hose reels, sprinkler valve sets, pressure gauges, drains, and isolation valves documented for inspection routines generally aligned with AS 1851.",
      spareParts: "Spare sprinkler heads: 24. Escutcheon plates: 24. Hose reel nozzle: 2. Valve tags and gauge cocks: assorted.",
    }),
    buildSampleFolder({
      discipline: "Hydraulics",
      trade: "Domestic Water",
      assets: [
        sampleAssetRow({ id: "HWS-01", description: "Domestic hot water plant", service: "Hydraulic Services", subservice: "Domestic Hot Water", level: "Ground Floor", space: "Hydraulic Plant Room", location: "Packaged hot water plant in hydraulic plant room.", make: "Rheem", model: "Commercial 610", serial: "RH610-4402", supplier: "ClearFlow Hydraulics", quantity: "1", retailPrice: "18600", life: "15", reference: "Hydraulic services schematic and AS/NZS 3500 installation records" }),
        sampleAssetRow({ id: "TMV-01", description: "Thermostatic mixing valve", service: "Hydraulic Services", subservice: "Domestic Hot Water", level: "Amenities", space: "Riser Cupboard", location: "Amenities riser cupboard serving basin outlets.", make: "Enware", model: "Aquamix", serial: "TMV-7780", supplier: "ClearFlow Hydraulics", quantity: "6", retailPrice: "420", life: "10", reference: "TMV commissioning register and temperature test sheet" }),
      ],
      supplier: "ClearFlow Hydraulics",
      technicalData: "Hydraulic systems include domestic cold water, hot water generation, tempered water outlets, isolation valves, and sanitary drainage connections installed to AS/NZS 3500 requirements.",
      spareParts: "TMV service kits: 6. Flexible connectors: 4. Isolation valve handles and labels: assorted.",
    }),
    buildSampleFolder({
      discipline: "FF&E",
      trade: "Furniture",
      assets: [
        sampleAssetRow({ id: "FUR-01", description: "Workstation furniture setting", service: "FF&E", subservice: "Furniture", level: "Level 1", space: "Open Office", location: "Level 1 open office workstation neighbourhoods.", make: "Schiavello", model: "Climate workstation", serial: "WF1500-BATCH01", supplier: "Studio Furnishings", quantity: "48", retailPrice: "1450", life: "10", reference: "FF&E schedule and supplier care instructions" }),
        sampleAssetRow({ id: "CHR-01", description: "Task chair", service: "FF&E", subservice: "Furniture", level: "Level 1", space: "Open Office", location: "Level 1 open office workstation chairs.", make: "Zenith", model: "Rumba task chair", serial: "CHR-BATCH02", supplier: "Studio Furnishings", quantity: "48", retailPrice: "620", life: "8", reference: "Chair warranty and care guide" }),
      ],
      supplier: "Studio Furnishings",
      technicalData: "FF&E items include workstation settings, task chairs, loose furniture, finishes selections, warranty references, and care requirements.",
      spareParts: "Spare chair castors: 20. Desk cable covers: 12. Finish touch-up kit: 1.",
    }),
  ].forEach(({ folder, data }) => {
    const clean = cleanFolder(folder);
    next.folders[folderKey(clean)] = { ...clean, data: mergeSectionData(data) };
  });

  const electrical = next.folders[folderKey({ discipline: "Electrical", trade: "Lighting", subTrade: "" })]?.data;
  if (electrical) {
    electrical.certificates = [];
    electrical.documents = [];
  }

  const mechanical = next.folders[folderKey({ discipline: "Mechanical", trade: "HVAC", subTrade: "Air Handling Units" })]?.data;
  if (mechanical) {
    mechanical.fields.spareParts = "";
    mechanical.warranties = [];
    if (mechanical.equipment[1]) {
      mechanical.equipment[1][11] = "";
      mechanical.equipment[1][15] = "";
    }
  }

  const fire = next.folders[folderKey({ discipline: "Fire Services", trade: "Wet Fire", subTrade: "" })]?.data;
  if (fire) {
    fire.fields.operatingInstructions = "";
    fire.fields.technicalData = "";
    fire.maintenance = [];
    fire.asBuilts = [];
  }

  const hydraulics = next.folders[folderKey({ discipline: "Hydraulics", trade: "Domestic Water", subTrade: "" })]?.data;
  if (hydraulics) {
    hydraulics.contacts = [];
    hydraulics.commissioning = [];
    hydraulics.documents = [];
  }

  const ffe = next.folders[folderKey({ discipline: "FF&E", trade: "Furniture", subTrade: "" })]?.data;
  if (ffe) {
    ffe.fields.introduction = "";
    ffe.fields.scopeOfWorks = "";
    ffe.fields.safetyRequirements = "";
    ffe.fields.emergencyProcedures = "";
    ffe.equipment = [];
    ffe.maintenance = [];
    ffe.warranties = [];
    ffe.certificates = [];
    ffe.commissioning = [];
    ffe.asBuilts = [];
    ffe.documents = [];
  }

  return next;
}

const listColumns = {
  siteDetails: ["siteName", "structureName", "levelName", "spaceName", "locationDescription"],
  contacts: ["companyName", "trade", "address", "phoneNumbers", "emails", "website"],
  equipment: [
    "assetId",
    "parentAssetId",
    "description",
    "serviceName",
    "subservice",
    "siteName",
    "structureName",
    "levelName",
    "spaceName",
    "locationDescription",
    "make",
    "model",
    "serialNumber",
    "supplier",
    "quantity",
    "retailPrice",
    "installDate",
    "warrantyExpiryDate",
    "lifeExpectancyYears",
    "referenceInformation",
    "updatedDate",
    "updatedUser",
  ],
  maintenance: ["assetId", "unit", "frequency", "details"],
  commissioning: ["asset", "activity", "date", "result", "signoff"],
  warranties: ["assetId", "provider", "start", "expiry", "conditions", "attachment"],
  certificates: ["type", "reference", "issuedBy", "issueDate", "notes", "attachment"],
  asBuilts: ["drawing", "revision", "date", "location", "notes"],
  documents: ["type", "title", "reference", "notes"],
};

const spreadsheetColumns = {
  project: [
    ["projectName", "Project Name"],
    ["clientName", "Client"],
    ["siteAddress", "Site Address"],
    ["preparedBy", "Prepared By"],
    ["revision", "Manual Revision"],
    ["handoverDate", "Handover Date"],
    ["projectSummary", "Project Summary"],
    ["projectImage", "Project Image"],
  ],
  sections: [
    ["introduction", "Introduction"],
    ["scopeOfWorks", "Scope of Works"],
    ["operatingInstructions", "Operating Instructions"],
    ["technicalData", "Technical Data"],
    ["commissioningSummary", "Commissioning Summary"],
    ["safetyRequirements", "Safety Requirements"],
    ["emergencyProcedures", "Emergency Procedures"],
    ["spareParts", "Spare Parts"],
  ],
  siteDetails: [
    ["siteName", "Site Name"],
    ["structureName", "Structure Name"],
    ["levelName", "Level Name"],
    ["spaceName", "Space Name"],
    ["locationDescription", "Location Description"],
  ],
  contacts: [
    ["companyName", "Company Name"],
    ["trade", "Trade"],
    ["address", "Address"],
    ["phoneNumbers", "Phone Numbers"],
    ["emails", "Emails"],
    ["website", "Website"],
  ],
  equipment: [
    ["assetId", "Asset ID"],
    ["parentAssetId", "Parent Asset ID"],
    ["description", "Description"],
    ["serviceName", "Service Name"],
    ["subservice", "Subservice"],
    ["siteName", "Site Name"],
    ["structureName", "Structure Name"],
    ["levelName", "Level Name"],
    ["spaceName", "Space Name"],
    ["locationDescription", "Location Description"],
    ["make", "Make"],
    ["model", "Model"],
    ["serialNumber", "Serial Number"],
    ["supplier", "Supplier"],
    ["quantity", "Quantity"],
    ["retailPrice", "Retail Price $"],
    ["installDate", "Install Date"],
    ["warrantyExpiryDate", "Wty Expiry Date"],
    ["lifeExpectancyYears", "Life Expectancy (yrs)"],
    ["referenceInformation", "Reference Information"],
    ["updatedDate", "Updated Date"],
    ["updatedUser", "Updated User"],
  ],
  maintenance: [
    ["assetId", "Asset ID"],
    ["unit", "Unit"],
    ["frequency", "Frequency"],
    ["details", "Details"],
  ],
  commissioning: [
    ["asset", "Asset / System"],
    ["activity", "Test / Activity"],
    ["date", "Date"],
    ["result", "Result"],
    ["signoff", "Witness / Sign-off"],
  ],
  warranties: [
    ["assetId", "Asset ID"],
    ["provider", "Provider"],
    ["start", "Start"],
    ["expiry", "Expiry"],
    ["conditions", "Conditions / Claim Details"],
    ["attachment", "Attached Document"],
  ],
  certificates: [
    ["type", "Certificate Type"],
    ["reference", "Reference"],
    ["issuedBy", "Issued By"],
    ["issueDate", "Issue Date"],
    ["notes", "Notes"],
    ["attachment", "Attached Document"],
  ],
  asBuilts: [
    ["drawing", "Drawing / Model"],
    ["revision", "Revision"],
    ["date", "Date"],
    ["location", "Location / Reference"],
    ["notes", "Notes"],
  ],
  documents: [
    ["type", "Type"],
    ["title", "Title"],
    ["reference", "Reference / Location"],
    ["notes", "Notes"],
  ],
};

const spreadsheetSheets = [
  ["Key Contacts", "contacts"],
  ["Assets", "equipment"],
  ["Maintenance", "maintenance"],
  ["Commissioning", "commissioning"],
  ["Warranties", "warranties"],
  ["Certificates", "certificates"],
  ["As Builts", "asBuilts"],
  ["Documents", "documents"],
];

const editorColumnLabels = {
  siteDetails: ["Site Name", "Structure Name", "Level Name", "Space Name", "Location Description"],
  contacts: ["Company Name", "Trade", "Address", "Phone Numbers", "Emails", "Website"],
  equipment: [
    "Asset ID",
    "Parent Asset ID",
    "Description",
    "Service Name",
    "Subservice",
    "Site Name",
    "Structure Name",
    "Level Name",
    "Space Name",
    "Location Description",
    "Make",
    "Model",
    "Serial Number",
    "Supplier",
    "Quantity",
    "Retail Price $",
    "Install Date",
    "Wty Expiry Date",
    "Life Expectancy (yrs)",
    "Reference Information",
    "Updated Date",
    "Updated User",
  ],
  maintenance: ["Asset ID", "Frequency", "Unit", "Routine", "Details"],
  commissioning: ["Asset / System", "Test / Activity", "Date", "Result", "Witness / Sign-off"],
  warranties: ["Asset ID", "Provider", "Start", "Expiry", "Conditions / Claim Details", "Attached Document"],
  certificates: ["Certificate Type", "Reference", "Issued By", "Issue Date", "Notes", "Attached Document"],
  asBuilts: ["Drawing / Model", "Revision", "Date", "Location / Reference", "Notes"],
  documents: ["Type", "Title", "Reference / Location", "Notes"],
};

let state;
const attachmentUrls = new Map();

function cloneData(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function showAppError(message) {
  const saveStateElement = document.querySelector("#saveState");
  const preview = document.querySelector("#manualPreview");
  if (saveStateElement) saveStateElement.textContent = "App needs attention";
  if (preview) {
    preview.innerHTML = `
      <div class="app-error">
        <h2>Preview could not update</h2>
        <p>${escapeHtml(message)}</p>
        <p>Refresh the page. If this message remains, tell Codex the text shown here.</p>
      </div>
    `;
  }
}

function folderKey(folder) {
  return [folder.discipline, folder.trade, folder.subTrade].map((part) => String(part || "").trim()).join(KEY_SEPARATOR);
}

function cleanFolder(folder) {
  return {
    discipline: String(folder.discipline || "General").trim() || "General",
    trade: String(folder.trade || "").trim(),
    subTrade: String(folder.subTrade || "").trim(),
  };
}

function normalizeAssetRow(row = []) {
  if (row.length <= 6) {
    const [assetId, description, location, manufacturerModel, serial, warranty] = row;
    const normalised = listColumns.equipment.map(() => "");
    normalised[0] = assetId || "";
    normalised[2] = description || "";
    normalised[9] = location || "";
    normalised[10] = manufacturerModel || "";
    normalised[12] = serial || "";
    normalised[17] = warranty || "";
    return normalised;
  }
  if (row.length === listColumns.equipment.length + 1) {
    return row.filter((_, index) => index !== 9).map((value) => value || "");
  }
  return listColumns.equipment.map((_, index) => row[index] || "");
}

function normalizeMaintenanceRow(row = []) {
  const normalisePeriod = (unit, frequency) => {
    const unitText = String(unit || "").trim();
    const frequencyText = String(frequency || "").trim();
    const unitMatch = unitOptions.find((option) => option.toLowerCase() === unitText.toLowerCase());
    const frequencyMatch = unitOptions.find((option) => option.toLowerCase() === frequencyText.toLowerCase());
    if (frequencyMatch) return [unitText, frequencyMatch];
    if (unitMatch) return [frequencyText, unitMatch];
    const commonPeriods = {
      hourly: ["1", "Hours"],
      daily: ["1", "Days"],
      monthly: ["1", "Months"],
      quarterly: ["3", "Months"],
      yearly: ["1", "Years"],
      annually: ["1", "Years"],
    };
    return commonPeriods[unitText.toLowerCase()] || [unitText, frequencyText];
  };
  if (row.length === 4) {
    const [assetId, unit, frequency, details] = row;
    const [normalisedUnit, normalisedFrequency] = normalisePeriod(unit, frequency);
    return [assetId || "", normalisedUnit, normalisedFrequency, details || ""];
  }
  if (row.length <= 5) {
    if (row.length === 5 && unitOptions.some((option) => option.toLowerCase() === String(row[3] || "").trim().toLowerCase())) {
      return [row[0] || "", row[2] || "", row[3] || "", row[4] || ""];
    }
    const [assetId, task, interval, responsible, notes] = row;
    const [unit, frequency] = normalisePeriod("", interval);
    return [
      assetId || "",
      unit,
      frequency,
      [task, responsible, notes].filter(Boolean).join(" - "),
    ];
  }
  if (row.length === 6) {
    const [assetId, asset, scheduleName, frequency, unit, details] = row;
    const [normalisedUnit, normalisedFrequency] = normalisePeriod(unit, frequency);
    return [assetId || "", normalisedUnit, normalisedFrequency, details || scheduleName || asset || ""];
  }
  const [unit, frequency] = normalisePeriod(row[2], row[3]);
  return [row[0] || "", unit, frequency, row[4] || ""];
}

function normalizeFixedRow(row = [], listName) {
  return listColumns[listName].map((_, index) => row[index] || "");
}

function normalizeContactRow(row = []) {
  if (row.length === 5) {
    const [role, name, company, phone, email] = row;
    return [
      company || name || "",
      role || "",
      "",
      phone || "",
      email || "",
      "",
    ];
  }
  return listColumns.contacts.map((_, index) => row[index] || "");
}

function normalizeSiteDetailRow(row = []) {
  if (row.length >= 6) {
    return [row[0] || "", row[1] || "", row[2] || "", row[3] || "", row[5] || row[4] || ""];
  }
  return listColumns.siteDetails.map((_, index) => row[index] || "");
}

function normalizeServiceClassificationRow(row = []) {
  return [row[0] || "", row[1] || ""];
}

function mergeSectionData(data = {}) {
  const merged = {
    ...cloneData(sectionDefaults),
    ...data,
    fields: {
      ...cloneData(sectionDefaults.fields),
      ...(data.fields || {}),
    },
  };
  merged.contacts = (merged.contacts || []).map(normalizeContactRow);
  merged.equipment = (merged.equipment || []).map(normalizeAssetRow);
  merged.maintenance = (merged.maintenance || []).map(normalizeMaintenanceRow);
  merged.warranties = (merged.warranties || []).map((row) => normalizeFixedRow(row, "warranties"));
  merged.certificates = (merged.certificates || []).map((row) => normalizeFixedRow(row, "certificates"));
  return merged;
}

function createFolder(folder, data = {}) {
  const clean = cleanFolder(folder);
  const key = folderKey(clean);
  if (state.folders[key] && !Object.keys(data).length) return clean;
  state.folders[key] = {
    ...clean,
    data: mergeSectionData(Object.keys(data).length ? data : state.folders[key]?.data),
  };
  return clean;
}

function ensureActiveFolder() {
  state.selectedFolder = cleanFolder(state.selectedFolder || defaults.selectedFolder);
  const key = folderKey(state.selectedFolder);
  if (!state.folders[key]) createFolder(state.selectedFolder);
  return state.folders[key];
}

function migrateLegacyData(parsed) {
  const selectedFolder = cleanFolder({
    discipline: parsed.fields?.tierDiscipline || defaults.selectedFolder.discipline,
    trade: parsed.fields?.tierTrade || defaults.selectedFolder.trade,
    subTrade: parsed.fields?.tierSubTrade || defaults.selectedFolder.subTrade,
  });
  const migrated = cloneData(defaults);
  migrated.fields = Object.fromEntries(projectFieldNames.map((name) => [name, parsed.fields?.[name] || ""]));
  migrated.siteDetails = (parsed.siteDetails || []).map(normalizeSiteDetailRow);
  migrated.serviceClassifications = cloneData(defaultServiceClassifications);
  migrated.selectedFolder = selectedFolder;
  const sectionData = {
    fields: Object.fromEntries(sectionFieldNames.map((name) => [name, parsed.fields?.[name] || ""])),
    contacts: parsed.contacts || [],
    equipment: parsed.equipment || [],
    maintenance: parsed.maintenance || [],
    commissioning: parsed.commissioning || [],
    warranties: parsed.warranties || [],
    certificates: parsed.certificates || [],
    asBuilts: parsed.asBuilts || [],
    documents: parsed.documents || [],
  };
  migrated.folders[folderKey(selectedFolder)] = { ...selectedFolder, data: mergeSectionData(sectionData) };
  return migrated;
}

function loadState() {
  let saved = null;
  let legacy = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
    legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  } catch {
    storageAvailable = false;
  }
  const raw = saved || legacy;
  if (!raw) {
    const fresh = cloneData(defaults);
    fresh.folders[folderKey(fresh.selectedFolder)] = {
      ...fresh.selectedFolder,
      data: mergeSectionData(),
    };
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.folders || Array.isArray(parsed.folders)) return migrateLegacyData(parsed);
    const loaded = {
      ...cloneData(defaults),
      ...parsed,
      fields: Object.fromEntries(projectFieldNames.map((name) => [name, parsed.fields?.[name] || ""])),
      siteDetails: (parsed.siteDetails || []).map(normalizeSiteDetailRow),
      serviceClassifications: (parsed.serviceClassifications || defaultServiceClassifications).map(normalizeServiceClassificationRow),
      selectedFolder: cleanFolder(parsed.selectedFolder || defaults.selectedFolder),
      folders: {},
    };
    Object.values(parsed.folders).forEach((folder) => {
      const clean = cleanFolder(folder);
      loaded.folders[folderKey(clean)] = {
        ...clean,
        data: mergeSectionData(folder.data),
      };
    });
    if (!Object.keys(loaded.folders).length) {
      loaded.folders[folderKey(loaded.selectedFolder)] = {
        ...loaded.selectedFolder,
        data: mergeSectionData(),
      };
    }
    return loaded;
  } catch {
    return cloneData(defaults);
  }
}

function saveState() {
  if (storageAvailable) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      storageAvailable = false;
    }
  }
  const saveStateElement = document.querySelector("#saveState");
  if (saveStateElement) {
    const label = storageAvailable ? "Draft saved" : "Draft active";
    saveStateElement.textContent = `${label} ${new Date().toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  }
}

function loadProjectDatabase() {
  if (!storageAvailable) return {};
  try {
    return JSON.parse(localStorage.getItem(PROJECT_DATABASE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProjectDatabase(database) {
  if (!storageAvailable) {
    alert("Project database storage is not available in this browser.");
    return false;
  }
  try {
    localStorage.setItem(PROJECT_DATABASE_KEY, JSON.stringify(database));
    return true;
  } catch {
    alert("The browser could not save the project database. It may be out of storage.");
    return false;
  }
}

function projectDatabaseName() {
  return document.querySelector("#projectDatabaseName")?.value.trim() || state.fields.projectName.trim() || "Untitled Project";
}

function renderProjectDatabaseControls(selectedName = "") {
  const select = document.querySelector("#projectDatabaseSelect");
  const nameInput = document.querySelector("#projectDatabaseName");
  if (!select || !nameInput) return;
  const database = loadProjectDatabase();
  const names = Object.keys(database).sort();
  select.innerHTML = [
    '<option value="">Select saved project...</option>',
    ...names.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`),
  ].join("");
  if (selectedName && names.includes(selectedName)) select.value = selectedName;
  nameInput.value = selectedName || nameInput.value || state.fields.projectName || "";
}

function saveCurrentProjectRecord(name = projectDatabaseName()) {
  const database = loadProjectDatabase();
  database[name] = {
    savedAt: new Date().toISOString(),
    data: cloneData(state),
  };
  if (saveProjectDatabase(database)) {
    renderProjectDatabaseControls(name);
    saveState();
  }
}

function loadProjectRecord(name) {
  const record = loadProjectDatabase()[name];
  if (!record) return;
  state = {
    ...cloneData(defaults),
    ...cloneData(record.data),
    fields: Object.fromEntries(projectFieldNames.map((field) => [field, record.data.fields?.[field] || ""])),
    siteDetails: (record.data.siteDetails || []).map(normalizeSiteDetailRow),
  };
  renderFolderPicker();
  renderEditors();
  persistAndRender();
  renderProjectDatabaseControls(name);
}

function markSaving() {
  const saveStateElement = document.querySelector("#saveState");
  if (saveStateElement) saveStateElement.textContent = "Saving...";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateAu(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const [year, month, day] = text.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function displayValue(value) {
  return formatDateAu(value);
}

function spreadsheetReady() {
  return typeof XLSX !== "undefined";
}

function excelValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? "").trim();
}

function sheetFromObjects(headers, rows) {
  return XLSX.utils.aoa_to_sheet([
    headers,
    ...rows.map((row) => headers.map((header) => row[header] ?? "")),
  ]);
}

function readSheetRows(workbook, name) {
  const sheet = workbook.Sheets[name];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }).map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [String(key).trim(), excelValue(value)])),
  );
}

function folderColumns() {
  return ["Discipline", "Trade", "Sub-Trade"];
}

function rowFolder(row) {
  return cleanFolder({
    discipline: row["Discipline"],
    trade: row["Trade"],
    subTrade: row["Sub-Trade"],
  });
}

function folderRow(folder) {
  return {
    Discipline: folder.discipline,
    Trade: folder.trade,
    "Sub-Trade": folder.subTrade,
  };
}

function rowFromArray(columns, row) {
  return Object.fromEntries(columns.map(([key, label], index) => [label, row[index] || ""]));
}

function arrayFromRow(columns, row) {
  return columns.map(([, label]) => row[label] || "");
}

function editorLabel(listName, columnIndex) {
  return editorColumnLabels[listName]?.[columnIndex] || "";
}

function textOrDash(value) {
  return escapeHtml(displayValue(value) || "Not provided");
}

function paragraph(value) {
  if (!value) return '<p class="empty-note">Not provided.</p>';
  return escapeHtml(value)
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join("");
}

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function currentManual() {
  return ensureActiveFolder().data;
}

function assetIds(manual = currentManual()) {
  return [...new Set(manual.equipment.map((row) => row[0]).filter(Boolean))];
}

function assetDescriptions(manual = currentManual()) {
  const descriptions = new Map();
  manual.equipment.forEach((row) => {
    if (row[0] && !descriptions.has(row[0])) descriptions.set(row[0], row[2] || "");
  });
  return descriptions;
}

function siteDetailValues(columnIndex) {
  return [...new Set((state.siteDetails || []).map((row) => row[columnIndex]).filter(Boolean))].sort();
}

function serviceNameValues() {
  return [...new Set((state.serviceClassifications || []).map((row) => normalizeServiceClassificationRow(row)[0]).filter(Boolean))].sort();
}

function subserviceValuesForAssetRow(row = []) {
  if (!row[3]) return [];
  return [
    ...new Set(
      (state.serviceClassifications || [])
        .map(normalizeServiceClassificationRow)
        .filter((classification) => classification[0] === row[3])
        .map((classification) => classification[1])
        .filter(Boolean),
    ),
  ].sort();
}

function siteDetailValuesForAssetRow(column, row = []) {
  if (column === "structureName" && !row[5]) return [];
  if (column === "levelName" && (!row[5] || !row[6])) return [];
  if (column === "spaceName" && (!row[5] || !row[6] || !row[7])) return [];
  const filters = {
    structureName: { 0: row[5] || "" },
    levelName: { 0: row[5] || "", 1: row[6] || "" },
    spaceName: { 0: row[5] || "", 1: row[6] || "", 2: row[7] || "" },
  }[column] || {};
  const columnIndex = siteDetailColumnIndex(column);
  return [
    ...new Set(
      (state.siteDetails || [])
        .map(normalizeSiteDetailRow)
        .filter((siteRow) => Object.entries(filters).every(([index, value]) => !value || siteRow[Number(index)] === value))
        .map((siteRow) => siteRow[columnIndex])
        .filter(Boolean),
    ),
  ].sort();
}

function clearAssetLocationChildren(row, column) {
  if (column === "siteName") {
    row[6] = "";
    row[7] = "";
    row[8] = "";
  }
  if (column === "structureName") {
    row[7] = "";
    row[8] = "";
  }
  if (column === "levelName") {
    row[8] = "";
  }
}

function clearAssetServiceChildren(row, column) {
  if (column === "serviceName") row[4] = "";
}

function siteDetailColumnIndex(column) {
  return {
    siteName: 0,
    structureName: 1,
    levelName: 2,
    spaceName: 3,
  }[column];
}

function assetAnchor(assetId, index, prefix = "asset") {
  return `${prefix}-asset-${slug(assetId) || "item"}-${index + 1}`;
}

const disciplineOrder = [
  "mechanical",
  "electrical",
  "hydraulic",
  "plumbing",
  "fire",
  "security",
  "communications",
  "ict",
  "vertical transport",
  "building",
  "architectural",
  "civil",
  "external works",
  "landscaping",
  "general",
  "other",
];

function disciplineRank(folder) {
  const discipline = String(folder.discipline || "").trim().toLowerCase();
  const exact = disciplineOrder.indexOf(discipline);
  if (exact >= 0) return exact;
  const partial = disciplineOrder.findIndex((item) => discipline.includes(item) || item.includes(discipline));
  return partial >= 0 ? partial : disciplineOrder.length;
}

function folderList() {
  return Object.values(state.folders).sort((a, b) =>
    `${a.discipline} ${a.trade} ${a.subTrade}`.localeCompare(`${b.discipline} ${b.trade} ${b.subTrade}`),
  );
}

function orderedManualFolders() {
  ensureActiveFolder();
  return Object.values(state.folders).sort((a, b) => {
    const rank = disciplineRank(a) - disciplineRank(b);
    if (rank) return rank;
    return `${a.discipline} ${a.trade} ${a.subTrade}`.localeCompare(`${b.discipline} ${b.trade} ${b.subTrade}`);
  });
}

function folderAnchor(folder) {
  return `folder-${slug(folderKey(folder)) || "manual-section"}`;
}

function sectionAnchor(folder, sectionId) {
  return `${folderAnchor(folder)}-${sectionId.replace(/^toc-/, "")}`;
}

function anchorTarget(id) {
  return `<a class="print-anchor" id="${id}" aria-hidden="true"></a>`;
}

function uniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort();
}

function uniqueFolderValues(items, field) {
  return [...new Set(items.map((item) => String(item[field] || "").trim()))].sort((a, b) => {
    if (a === "") return -1;
    if (b === "") return 1;
    return a.localeCompare(b);
  });
}

function setOptions(select, values, selectedValue) {
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value || "(blank)";
    select.appendChild(option);
  });
  if (values.includes(selectedValue)) select.value = selectedValue;
}

function renderFolderPicker() {
  ensureActiveFolder();
  const folders = folderList();
  const disciplineSelect = document.querySelector("#disciplineSelect");
  const tradeSelect = document.querySelector("#tradeSelect");
  const subTradeSelect = document.querySelector("#subTradeSelect");
  const disciplines = uniqueValues(folders, "discipline");
  setOptions(disciplineSelect, disciplines, state.selectedFolder.discipline);

  const trades = uniqueFolderValues(
    folders.filter((folder) => folder.discipline === disciplineSelect.value),
    "trade",
  );
  if (!trades.includes(state.selectedFolder.trade)) state.selectedFolder.trade = trades[0] || "";
  setOptions(tradeSelect, trades, state.selectedFolder.trade);

  const subTrades = uniqueFolderValues(
    folders.filter((folder) => folder.discipline === disciplineSelect.value && folder.trade === tradeSelect.value),
    "subTrade",
  );
  if (!subTrades.includes(state.selectedFolder.subTrade)) state.selectedFolder.subTrade = subTrades[0] || "";
  setOptions(subTradeSelect, subTrades, state.selectedFolder.subTrade);
  syncFolderEditFields();
}

function selectExistingFolder(nextFolder) {
  const clean = cleanFolder(nextFolder);
  const matching = state.folders[folderKey(clean)];
  if (matching) state.selectedFolder = clean;
  renderFolderPicker();
  renderEditors();
  persistAndRender();
}

function syncFolderEditFields() {
  const selected = cleanFolder(state.selectedFolder || defaults.selectedFolder);
  const discipline = document.querySelector("#editDiscipline");
  const trade = document.querySelector("#editTrade");
  const subTrade = document.querySelector("#editSubTrade");
  if (discipline) discipline.value = selected.discipline;
  if (trade) trade.value = selected.trade;
  if (subTrade) subTrade.value = selected.subTrade;
}

function renameSelectedFolder() {
  const oldFolder = ensureActiveFolder();
  const oldKey = folderKey(oldFolder);
  const nextFolder = cleanFolder({
    discipline: document.querySelector("#editDiscipline").value,
    trade: document.querySelector("#editTrade").value,
    subTrade: document.querySelector("#editSubTrade").value,
  });
  const nextKey = folderKey(nextFolder);
  if (oldKey === nextKey) {
    syncFolderEditFields();
    return;
  }
  const existingFolder = state.folders[nextKey];
  if (existingFolder && !confirm("That folder path already exists. Merge this folder into the existing path?")) {
    syncFolderEditFields();
    return;
  }
  state.folders[nextKey] = {
    ...nextFolder,
    data: existingFolder ? mergeSectionData({ ...existingFolder.data, ...oldFolder.data }) : oldFolder.data,
  };
  delete state.folders[oldKey];
  state.selectedFolder = nextFolder;
  renderFolderPicker();
  renderEditors();
  persistAndRender();
}

function attachmentKey(listName, rowIndex, name) {
  return [folderKey(state.selectedFolder), listName, rowIndex, name || ""].join(KEY_SEPARATOR);
}

function firstAttachmentName(name) {
  return String(name || "").split(",").map((part) => part.trim()).filter(Boolean)[0] || "";
}

function getAttachmentUrl(listName, rowIndex, name) {
  const firstName = firstAttachmentName(name);
  return attachmentUrls.get(attachmentKey(listName, rowIndex, firstName));
}

function openAttachmentUrl(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function activateTab(tab) {
  document.body.classList.remove("settings-open");
  document.querySelectorAll(".tab, .panel").forEach((element) => element.classList.remove("active"));
  tab.classList.add("active");
  document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add("active");
}

function addSectionNavigationButtons() {
  const tabs = [...document.querySelectorAll(".tab")];
  tabs.forEach((tab, index) => {
    const panel = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
    if (!panel || panel.querySelector(".section-footer")) return;
    const footer = document.createElement("div");
    footer.className = "section-footer";
    const goToTab = (targetTab) => {
      if (!targetTab) return;
      activateTab(targetTab);
      document.querySelector(".workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const previous = document.createElement("button");
    previous.className = "secondary previous-section";
    previous.type = "button";
    previous.textContent = "Previous Section";
    previous.disabled = index === 0;
    previous.addEventListener("click", () => goToTab(tabs[index - 1]));

    const project = document.createElement("button");
    project.className = "secondary project-section";
    project.type = "button";
    project.textContent = "Home";
    project.disabled = index === 0;
    project.addEventListener("click", () => goToTab(tabs[0]));

    const next = document.createElement("button");
    next.className = "next-section";
    next.type = "button";
    next.textContent = "Next Section";
    next.disabled = index === tabs.length - 1;
    next.addEventListener("click", () => goToTab(tabs[index + 1]));

    footer.appendChild(project);
    footer.appendChild(previous);
    footer.appendChild(next);
    panel.appendChild(footer);
  });
}

function createTableRows(listName, rows) {
  const target = document.querySelector(`#${listName}Rows`);
  target.innerHTML = "";
  const descriptions = assetDescriptions();
  const targetData = listName === "siteDetails" ? state.siteDetails : currentManual()[listName];
  rows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    if (listName === "maintenance" || listName === "warranties") tr.dataset.linkedAssetRow = String(rowIndex);
    listColumns[listName].forEach((column, columnIndex) => {
      const td = document.createElement("td");
      td.dataset.label = editorLabel(listName, columnIndex);
      if (listName === "equipment" && column === "description") td.className = "wide-description-cell";
      const longField = ["notes", "task", "details", "conditions", "signoff", "referenceInformation"].includes(column);
      if (longField || ["description", "locationDescription", "address", "emails", "website"].includes(column)) {
        td.classList.add("editor-wide-field");
      }
      if (column === "attachment") {
        const attachmentText = document.createElement("input");
        const attachmentOpen = document.createElement("button");
        attachmentOpen.className = "secondary attachment-open";
        attachmentOpen.type = "button";
        const syncAttachmentOpenLink = () => {
          const url = getAttachmentUrl(listName, rowIndex, attachmentText.value);
          attachmentOpen.textContent = url ? "Open selected file" : "Choose file to open";
          attachmentOpen.toggleAttribute("hidden", !url);
          attachmentOpen.disabled = !url;
        };
        attachmentOpen.addEventListener("click", () => {
          const url = getAttachmentUrl(listName, rowIndex, attachmentText.value);
          if (url) {
            openAttachmentUrl(url);
            return;
          }
          alert("Choose the file again first, then click Open selected file.");
        });
        attachmentText.placeholder = "No document selected";
        attachmentText.value = row[columnIndex] || "";
        attachmentText.addEventListener("input", () => {
          targetData[rowIndex][columnIndex] = attachmentText.value;
          syncAttachmentOpenLink();
          persistAndRender();
        });
        const fileInput = document.createElement("input");
        fileInput.className = "file-picker";
        fileInput.type = "file";
        fileInput.addEventListener("change", () => {
          const files = [...fileInput.files];
          const names = files.map((file) => file.name).join(", ");
          files.forEach((file) => {
            const key = attachmentKey(listName, rowIndex, file.name);
            const previousUrl = attachmentUrls.get(key);
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            attachmentUrls.set(key, URL.createObjectURL(file));
          });
          attachmentText.value = names;
          targetData[rowIndex][columnIndex] = names;
          syncAttachmentOpenLink();
          persistAndRender();
        });
        syncAttachmentOpenLink();
        td.appendChild(attachmentText);
        td.appendChild(fileInput);
        td.appendChild(attachmentOpen);
        tr.appendChild(td);
        return;
      }
      if (listName === "equipment" && ["serviceName", "subservice"].includes(column)) {
        const select = document.createElement("select");
        const values = column === "serviceName" ? serviceNameValues() : subserviceValuesForAssetRow(row);
        const currentValue = row[columnIndex] || "";
        const options = currentValue && !values.includes(currentValue) ? [currentValue, ...values] : values;
        const waitingForParent = column === "subservice" && !row[3];
        select.innerHTML = [
          `<option value="">${waitingForParent ? "Select service first..." : "Select..."}</option>`,
          ...options.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
        ].join("");
        select.disabled = waitingForParent && !currentValue;
        select.value = currentValue;
        select.addEventListener("change", () => {
          targetData[rowIndex][columnIndex] = select.value;
          clearAssetServiceChildren(targetData[rowIndex], column);
          renderEditors();
          persistAndRender();
        });
        td.appendChild(select);
        tr.appendChild(td);
        return;
      }
      if (listName === "equipment" && ["siteName", "structureName", "levelName", "spaceName"].includes(column)) {
        const select = document.createElement("select");
        const values = siteDetailValuesForAssetRow(column, row);
        const currentValue = row[columnIndex] || "";
        const options = currentValue && !values.includes(currentValue) ? [currentValue, ...values] : values;
        const waitingForParent =
          (column === "structureName" && !row[5]) ||
          (column === "levelName" && (!row[5] || !row[6])) ||
          (column === "spaceName" && (!row[5] || !row[6] || !row[7]));
        select.innerHTML = [
          `<option value="">${waitingForParent ? "Select parent first..." : "Select..."}</option>`,
          ...options.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
        ].join("");
        select.disabled = waitingForParent && !currentValue;
        select.value = currentValue;
        select.addEventListener("change", () => {
          targetData[rowIndex][columnIndex] = select.value;
          clearAssetLocationChildren(targetData[rowIndex], column);
          renderEditors();
          persistAndRender();
        });
        td.appendChild(select);
        tr.appendChild(td);
        return;
      }
      const input = document.createElement(longField || (listName === "equipment" && column === "description") ? "textarea" : "input");
      if (listName === "equipment" && column === "description") input.rows = 3;
      if ((listName === "maintenance" || listName === "warranties") && columnIndex === 0) {
        input.setAttribute("list", "assetIdOptions");
        input.placeholder = "Pick or type Asset ID";
      }
      if (listName === "contacts" && column === "trade") {
        input.setAttribute("list", "tradeOptions");
        input.placeholder = "Pick or type Trade";
      }
      if (listName === "maintenance" && column === "unit") {
        input.placeholder = "e.g. 1, 3, 6";
      }
      if (listName === "maintenance" && column === "frequency") {
        input.setAttribute("list", "unitOptions");
        input.placeholder = "Hours, Days, Months, Years";
      }
      input.value = row[columnIndex] || "";
      if (!input.rows) input.rows = 2;
      input.addEventListener("input", () => {
        targetData[rowIndex][columnIndex] = input.value;
        if ((listName === "maintenance" || listName === "warranties") && columnIndex === 0) renderLinkedAssetDescriptionCells();
        if (listName === "siteDetails") renderSiteDetailDatalists();
        if (listName === "maintenance" && column === "unit") {
          const matchedUnit = unitOptions.find((option) => option.toLowerCase() === input.value.trim().toLowerCase());
          if (matchedUnit) {
            targetData[rowIndex][columnIndex] = "";
            targetData[rowIndex][2] = matchedUnit;
            renderEditors();
          }
        }
        if (listName === "equipment" && (columnIndex === 0 || columnIndex === 2)) {
          renderAssetIdDatalist();
          renderLinkedAssetDescriptionCells();
        }
        persistAndRender();
      });
      td.appendChild(input);
      tr.appendChild(td);
      if ((listName === "maintenance" || listName === "warranties") && columnIndex === 0) {
        const description = document.createElement("td");
        description.className = "derived-cell";
        description.dataset.label = "Description";
        description.dataset.linkedAssetList = listName;
        description.dataset.assetDescriptionFor = String(rowIndex);
        description.textContent = descriptions.get(row[0]) || "Not found";
        tr.appendChild(description);
      }
    });
    const action = document.createElement("td");
    action.className = "editor-action-field";
    action.dataset.label = "Action";
    const remove = document.createElement("button");
    remove.className = "remove-row";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      targetData.splice(rowIndex, 1);
      renderEditors();
      persistAndRender();
    });
    action.appendChild(remove);
    tr.appendChild(action);
    target.appendChild(tr);
  });
}

function renderLinkedAssetDescriptionCells() {
  const descriptions = assetDescriptions();
  document.querySelectorAll("[data-asset-description-for]").forEach((cell) => {
    const rowIndex = Number(cell.dataset.assetDescriptionFor);
    const listName = cell.dataset.linkedAssetList || "maintenance";
    const assetId = currentManual()[listName]?.[rowIndex]?.[0] || "";
    cell.textContent = descriptions.get(assetId) || "Not found";
  });
}

function renderAssetIdDatalist() {
  let datalist = document.querySelector("#assetIdOptions");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "assetIdOptions";
    document.body.appendChild(datalist);
  }
  const descriptions = assetDescriptions();
  datalist.innerHTML = assetIds()
    .map((assetId) => `<option value="${escapeHtml(assetId)}" label="${escapeHtml([assetId, descriptions.get(assetId)].filter(Boolean).join(" - "))}"></option>`)
    .join("");
}

function renderUnitDatalist() {
  let datalist = document.querySelector("#unitOptions");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "unitOptions";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = unitOptions.map((option) => `<option value="${option}"></option>`).join("");
}

function renderTradeDatalist() {
  let datalist = document.querySelector("#tradeOptions");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "tradeOptions";
    document.body.appendChild(datalist);
  }
  const classificationValues = (state.serviceClassifications || [])
    .flatMap((row) => normalizeServiceClassificationRow(row))
    .filter(Boolean);
  datalist.innerHTML = [...new Set(classificationValues)].sort()
    .map((trade) => `<option value="${escapeHtml(trade)}"></option>`)
    .join("");
}

function renderSiteDetailDatalists() {
  const siteFields = [
    ["siteName", 0],
    ["structureName", 1],
    ["levelName", 2],
    ["spaceName", 3],
  ];
  siteFields.forEach(([field, index]) => {
    let datalist = document.querySelector(`#${field}Options`);
    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = `${field}Options`;
      document.body.appendChild(datalist);
    }
    datalist.innerHTML = siteDetailValues(index)
      .map((value) => `<option value="${escapeHtml(value)}"></option>`)
      .join("");
  });
}

const siteTierConfig = [
  { key: "site", label: "Site Name", column: 0, addLabel: "Add Site", placeholder: "New site name" },
  { key: "structure", label: "Structure", column: 1, addLabel: "Add Structure", placeholder: "New structure name", parent: "site" },
  { key: "level", label: "Level", column: 2, addLabel: "Add Level", placeholder: "New level name", parent: "structure" },
  { key: "space", label: "Space", column: 3, addLabel: "Add Space", placeholder: "New space name", parent: "level" },
  {
    key: "description",
    label: "Location Description",
    column: 4,
    addLabel: "Add Description",
    placeholder: "New location description",
    parent: "space",
  },
];

function selectedSiteFilters(tierKey) {
  const filters = {};
  for (const tier of siteTierConfig) {
    if (tier.key === tierKey) break;
    if (tier.key !== "description") filters[tier.key] = selectedSiteDetailPath[tier.key] || "";
  }
  return filters;
}

function siteRowMatchesFilters(row, filters = {}) {
  const normal = normalizeSiteDetailRow(row);
  return Object.entries(filters).every(([key, value]) => {
    const tier = siteTierConfig.find((item) => item.key === key);
    return !tier || normal[tier.column] === value;
  });
}

function siteTierValues(tierKey) {
  const tier = siteTierConfig.find((item) => item.key === tierKey);
  if (!tier) return [];
  return [
    ...new Set(
      (state.siteDetails || [])
        .filter((row) => siteRowMatchesFilters(row, selectedSiteFilters(tierKey)))
        .map((row) => normalizeSiteDetailRow(row)[tier.column])
        .filter(Boolean),
    ),
  ].sort();
}

function sitePathForTier(tierKey, value) {
  const path = { ...selectedSiteDetailPath };
  if (tierKey === "site") {
    return { site: value, structure: "", level: "", space: "" };
  }
  if (tierKey === "structure") {
    return { site: path.site, structure: value, level: "", space: "" };
  }
  if (tierKey === "level") {
    return { site: path.site, structure: path.structure, level: value, space: "" };
  }
  if (tierKey === "space") {
    return { site: path.site, structure: path.structure, level: path.level, space: value };
  }
  return path;
}

function rowForSiteTierAdd(tierKey, value) {
  const path = { ...selectedSiteDetailPath };
  if (tierKey === "site") return [value, "", "", "", ""];
  if (tierKey === "structure") return [path.site, value, "", "", ""];
  if (tierKey === "level") return [path.site, path.structure, value, "", ""];
  if (tierKey === "space") return [path.site, path.structure, path.level, value, ""];
  if (tierKey === "description") return [path.site, path.structure, path.level, path.space, value];
  return ["", "", "", "", ""];
}

function syncSelectedSitePath() {
  const sites = siteTierValues("site");
  if (selectedSiteDetailPath.site && !sites.includes(selectedSiteDetailPath.site)) {
    selectedSiteDetailPath = { site: "", structure: "", level: "", space: "" };
  }
  if (!selectedSiteDetailPath.site && sites.length) selectedSiteDetailPath.site = sites[0];

  const structures = siteTierValues("structure");
  if (selectedSiteDetailPath.structure && !structures.includes(selectedSiteDetailPath.structure)) {
    selectedSiteDetailPath.structure = "";
    selectedSiteDetailPath.level = "";
    selectedSiteDetailPath.space = "";
  }

  const levels = siteTierValues("level");
  if (selectedSiteDetailPath.level && !levels.includes(selectedSiteDetailPath.level)) {
    selectedSiteDetailPath.level = "";
    selectedSiteDetailPath.space = "";
  }

  const spaces = siteTierValues("space");
  if (selectedSiteDetailPath.space && !spaces.includes(selectedSiteDetailPath.space)) selectedSiteDetailPath.space = "";
}

function siteTierNeedsParent(tier) {
  return tier.parent && !selectedSiteDetailPath[tier.parent];
}

function siteTierHtml(tier) {
  const values = siteTierValues(tier.key);
  const selectedValue = tier.key === "description" ? "" : selectedSiteDetailPath[tier.key] || "";
  const disabled = siteTierNeedsParent(tier);
  return `
    <section class="site-tier-card">
      <h3>${tier.label}</h3>
      <div class="site-tier-add">
        <input data-site-tier-input="${tier.key}" placeholder="${tier.placeholder}" ${disabled ? "disabled" : ""} />
        <button class="site-tier-add-button" data-site-tier-add="${tier.key}" type="button" ${disabled ? "disabled" : ""}>${tier.addLabel}</button>
      </div>
      <div class="site-tier-list">
        ${
          disabled
            ? `<p class="empty-note">Select ${siteTierConfig.find((item) => item.key === tier.parent)?.label || "the previous tier"} first.</p>`
            : values.length
              ? values
                  .map((value) => {
                    const active = selectedValue === value ? " active" : "";
                    return `
                      <div class="site-tier-value">
                        <button class="site-tier-select${active}" data-site-tier-select="${tier.key}" data-site-tier-value="${escapeHtml(value)}" type="button">${escapeHtml(value)}</button>
                        <button class="remove-row site-tier-remove" data-site-tier-remove="${tier.key}" data-site-tier-value="${escapeHtml(value)}" type="button">Remove</button>
                      </div>
                    `;
                  })
                  .join("")
              : `<p class="empty-note">No ${tier.label.toLowerCase()} values yet.</p>`
        }
      </div>
    </section>
  `;
}

function siteTreeHtml() {
  syncSelectedSitePath();
  return `<div class="site-tier-tree">${siteTierConfig.map(siteTierHtml).join("")}</div>`;
}

function setSiteDetailsMessage(message, isError = false) {
  const target = document.querySelector("#siteDetailsMessage");
  if (!target) return;
  target.textContent = message;
  target.classList.toggle("error", isError);
}

function addSiteDetailRow(row) {
  const nextRow = normalizeSiteDetailRow(row);
  if (!nextRow.some(Boolean)) {
    setSiteDetailsMessage("Enter at least one site detail before adding.", true);
    return false;
  }
  if (!Array.isArray(state.siteDetails)) state.siteDetails = [];
  state.siteDetails.push(nextRow);
  renderSiteDetailsTree();
  renderSiteDetailDatalists();
  persistAndRender();
  setSiteDetailsMessage("Location path added to the tree.");
  return true;
}

function addSiteDetailFromTree(row) {
  return addSiteDetailRow(row);
}

function handleSiteTreeAdd(button) {
  const form = button.closest(".site-tree-add-form");
  if (!form) return false;
  const action = form.dataset.siteAction;
  let payload = {};
  try {
    payload = JSON.parse(decodeURIComponent(form.dataset.sitePayload || "%7B%7D"));
  } catch {
    payload = {};
  }
  const { site = "", structure = "", level = "", space = "" } = payload;
  const values = {};
  form.querySelectorAll("[data-site-field]").forEach((field) => {
    values[field.dataset.siteField] = field.value.trim();
  });

  if (action === "structure") {
    if (!values.structure) {
      setSiteDetailsMessage("Enter a Structure Name before adding.", true);
      return false;
    }
    return addSiteDetailFromTree([site, values.structure, values.level || "", values.space || "", values.description || ""]);
  }

  if (action === "level") {
    if (!values.level) {
      setSiteDetailsMessage("Enter a Level Name before adding.", true);
      return false;
    }
    return addSiteDetailFromTree([site, structure, values.level, values.space || "", values.description || ""]);
  }

  if (action === "space") {
    if (!values.space) {
      setSiteDetailsMessage("Enter a Space Name before adding.", true);
      return false;
    }
    return addSiteDetailFromTree([site, structure, level, values.space, values.description || ""]);
  }

  if (action === "description") {
    if (!values.description) {
      setSiteDetailsMessage("Enter a Location Description before adding.", true);
      return false;
    }
    return addSiteDetailFromTree([site, structure, level, space, values.description]);
  }
  return false;
}

function payloadFromSiteButton(button) {
  try {
    return JSON.parse(decodeURIComponent(button.dataset.sitePayload || "%7B%7D"));
  } catch {
    return {};
  }
}

function fillSiteDetailFields(payload = {}) {
  const fieldMap = {
    site: "#siteDetailSite",
    structure: "#siteDetailStructure",
    level: "#siteDetailLevel",
    space: "#siteDetailSpace",
    description: "#siteDetailDescription",
  };
  Object.entries(fieldMap).forEach(([key, selector]) => {
    const field = document.querySelector(selector);
    if (field) field.value = payload[key] || "";
  });
  setSiteDetailsMessage("Path copied. Edit the fields above, then click Add Location Path.");
  document.querySelector("#siteDetailSite")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function handleSiteTierSelect(button) {
  const tierKey = button.dataset.siteTierSelect;
  const value = button.dataset.siteTierValue || "";
  if (!tierKey || !value) return;
  selectedSiteDetailPath = sitePathForTier(tierKey, value);
  renderSiteDetailsTree();
}

function handleSiteTierAdd(button) {
  const tierKey = button.dataset.siteTierAdd;
  const tier = siteTierConfig.find((item) => item.key === tierKey);
  const input = document.querySelector(`[data-site-tier-input="${tierKey}"]`);
  const value = input?.value.trim() || "";
  if (!tier) return;
  if (siteTierNeedsParent(tier)) {
    setSiteDetailsMessage(`Select ${siteTierConfig.find((item) => item.key === tier.parent)?.label || "the previous tier"} first.`, true);
    return;
  }
  if (!value) {
    setSiteDetailsMessage(`Enter a ${tier.label} value before adding.`, true);
    return;
  }
  const added = addSiteDetailRow(rowForSiteTierAdd(tierKey, value));
  if (!added) return;
  if (tierKey !== "description") selectedSiteDetailPath = sitePathForTier(tierKey, value);
  renderSiteDetailsTree();
}

function handleSiteTierRemove(button) {
  const tierKey = button.dataset.siteTierRemove;
  const value = button.dataset.siteTierValue || "";
  const tier = siteTierConfig.find((item) => item.key === tierKey);
  if (!tier || !value) return;
  const filters = selectedSiteFilters(tierKey);
  state.siteDetails = (state.siteDetails || []).filter((row) => {
    const normal = normalizeSiteDetailRow(row);
    return !(siteRowMatchesFilters(row, filters) && normal[tier.column] === value);
  });
  if (tierKey !== "description" && selectedSiteDetailPath[tierKey] === value) {
    selectedSiteDetailPath = sitePathForTier(tierKey, "");
  }
  syncSelectedSitePath();
  renderSiteDetailsTree();
  renderSiteDetailDatalists();
  persistAndRender();
  setSiteDetailsMessage("Site detail removed.");
}

function renderSiteDetailsTree() {
  const target = document.querySelector("#siteDetailsTree");
  if (!target) return;
  target.innerHTML = siteTreeHtml();
  target.onclick = (event) => {
    const selectButton = event.target.closest(".site-tier-select");
    if (selectButton && target.contains(selectButton)) {
      event.preventDefault();
      event.stopPropagation();
      handleSiteTierSelect(selectButton);
      return;
    }
    const addButton = event.target.closest(".site-tier-add-button");
    if (addButton && target.contains(addButton)) {
      event.preventDefault();
      event.stopPropagation();
      handleSiteTierAdd(addButton);
      return;
    }
    const removeButton = event.target.closest(".site-tier-remove");
    if (removeButton && target.contains(removeButton)) {
      event.preventDefault();
      event.stopPropagation();
      handleSiteTierRemove(removeButton);
    }
  };
  target.querySelectorAll(".remove-site-detail").forEach((button) => {
    button.addEventListener("click", () => {
      state.siteDetails.splice(Number(button.dataset.siteDetailIndex), 1);
      renderSiteDetailsTree();
      renderSiteDetailDatalists();
      persistAndRender();
    });
  });
}

function renderServiceClassificationTable() {
  const target = document.querySelector("#serviceClassificationTable");
  if (!target) return;
  const rows = (state.serviceClassifications || []).map(normalizeServiceClassificationRow);
  const services = serviceNameValues();
  if (selectedServiceClassification && !services.includes(selectedServiceClassification)) selectedServiceClassification = "";
  if (!selectedServiceClassification && services.length) selectedServiceClassification = services[0];
  const subservices = rows.filter(([service]) => service === selectedServiceClassification);
  target.innerHTML = `
    <section class="service-classification-tier">
      <h3>Service Name</h3>
      <div class="service-classification-add">
        <input id="newServiceName" placeholder="New service name" />
        <button id="addServiceClassification" type="button">Add Service</button>
      </div>
      <div class="service-classification-list">
        ${
          services.length
            ? services
                .map(
                  (service) => `
                    <div class="service-classification-value">
                      <button class="service-classification-select${service === selectedServiceClassification ? " active" : ""}" data-service-name="${escapeHtml(service)}" type="button">${escapeHtml(service)}</button>
                      <button class="remove-row remove-service-classification" data-service-name-remove="${escapeHtml(service)}" type="button">Remove</button>
                    </div>
                  `,
                )
                .join("")
            : '<p class="empty-note">No services added.</p>'
        }
      </div>
    </section>
    <section class="service-classification-tier">
      <h3>Sub Service</h3>
      <div class="service-classification-add">
        <input id="newSubService" placeholder="New sub service" ${selectedServiceClassification ? "" : "disabled"} />
        <button id="addSubServiceClassification" type="button" ${selectedServiceClassification ? "" : "disabled"}>Add Sub Service</button>
      </div>
      <div class="service-classification-list">
        ${
          selectedServiceClassification
            ? subservices.length
              ? subservices
                  .map(
                    ([service, subservice], index) => `
                      <div class="service-classification-value">
                        <span>${escapeHtml(subservice || "(blank)")}</span>
                        <button class="remove-row remove-service-classification" data-service-row-remove="${index}" data-service-name="${escapeHtml(service)}" data-sub-service="${escapeHtml(subservice)}" type="button">Remove</button>
                      </div>
                    `,
                  )
                  .join("")
              : '<p class="empty-note">No sub services for the selected service.</p>'
            : '<p class="empty-note">Select or add a service first.</p>'
        }
      </div>
    </section>
  `;
}

function moneyValue(value) {
  const numeric = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function currencyAu(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function filled(value) {
  return String(value || "").trim().length > 0;
}

function fieldCompletion(items) {
  const total = items.length || 1;
  const complete = items.filter((item) => filled(item.value)).length;
  return {
    complete,
    total,
    outstanding: items.filter((item) => !filled(item.value)).map((item) => item.label),
  };
}

function rowCompletion(rows, requiredColumns, labels, emptyMessage) {
  if (!rows.length) {
    return {
      complete: 0,
      total: 1,
      outstanding: [emptyMessage],
    };
  }
  const total = rows.length * requiredColumns.length;
  let complete = 0;
  const missing = new Set();
  rows.forEach((row) => {
    requiredColumns.forEach((index) => {
      if (filled(row[index])) {
        complete += 1;
      } else {
        missing.add(labels[index] || `Column ${index + 1}`);
      }
    });
  });
  return {
    complete,
    total: total || 1,
    outstanding: [...missing],
  };
}

function dashboardSection(label, completion) {
  const percent = Math.round((completion.complete / completion.total) * 100);
  const outstanding = completion.outstanding.length ? completion.outstanding.slice(0, 4) : ["Complete"];
  return {
    label,
    complete: completion.complete,
    total: completion.total,
    percent,
    outstanding,
  };
}

function completionClass(percent) {
  if (percent >= 100) return "complete";
  if (percent > 0) return "partial";
  return "empty";
}

function projectDashboardSection() {
  return dashboardSection(
    "Project",
    fieldCompletion([
      { label: "Project name", value: state.fields.projectName },
      { label: "Client", value: state.fields.clientName },
      { label: "Site address", value: state.fields.siteAddress },
      { label: "Prepared by", value: state.fields.preparedBy },
      { label: "Manual revision", value: state.fields.revision },
      { label: "Handover date", value: state.fields.handoverDate },
      { label: "Project image", value: state.fields.projectImage },
      { label: "Project summary", value: state.fields.projectSummary },
    ]),
  );
}

function dashboardSections(manual = currentManual(), options = {}) {
  const sections = [
    dashboardSection(
      "Intro & Scope",
      fieldCompletion([
        { label: "Introduction", value: manual.fields.introduction },
        { label: "Scope of works", value: manual.fields.scopeOfWorks },
      ]),
    ),
    dashboardSection("Key Contacts", rowCompletion(manual.contacts, [0, 1, 2, 3, 4, 5], ["Company Name", "Trade", "Address", "Phone Numbers", "Emails", "Website"], "Add at least one key contact")),
    dashboardSection("Assets", rowCompletion(manual.equipment, [0, 2, 3, 5, 6, 7, 8, 10, 11, 13, 14, 15], assetHeaders, "Add at least one asset")),
    dashboardSection("Maintenance", rowCompletion(manual.maintenance, [0, 1, 2, 3], ["Asset ID", "Frequency", "Unit", "Routine"], "Add at least one maintenance task")),
    dashboardSection(
      "Technical Data",
      fieldCompletion([
        { label: "Operating instructions", value: manual.fields.operatingInstructions },
        { label: "Technical data", value: manual.fields.technicalData },
      ]),
    ),
    dashboardSection("Warranties", rowCompletion(manual.warranties, [0, 1, 2, 3], ["Asset ID", "Provider", "Start Date", "Expiry Date"], "Add warranty details")),
    dashboardSection("Certificates", rowCompletion(manual.certificates, [0, 1, 2, 3], ["Certificate Type", "Reference", "Issued By", "Issue Date"], "Add certificate details")),
    dashboardSection("Commissioning", rowCompletion(manual.commissioning, [0, 1, 2, 3, 4], ["Asset / System", "Activity", "Date", "Result", "Witness"], "Add commissioning details")),
    dashboardSection(
      "Spare Parts",
      fieldCompletion([{ label: "Spare parts", value: manual.fields.spareParts }]),
    ),
    dashboardSection("As Builts", rowCompletion(manual.asBuilts, [0, 1, 2, 3], ["Drawing / Model", "Revision", "Date", "Location / Reference"], "Add as-built details")),
    dashboardSection("Documents", rowCompletion(manual.documents, [0, 1, 2], ["Type", "Title", "Reference / Location"], "Add document references")),
    dashboardSection(
      "Safety",
      fieldCompletion([
        { label: "Safety requirements", value: manual.fields.safetyRequirements },
        { label: "Emergency procedures", value: manual.fields.emergencyProcedures },
      ]),
    ),
  ];
  return options.includeProject ? [projectDashboardSection(), ...sections] : sections;
}

function completionFromSections(sections) {
  const totals = sections.reduce(
    (summary, section) => ({
      complete: summary.complete + section.complete,
      total: summary.total + section.total,
    }),
    { complete: 0, total: 0 },
  );
  return totals.total ? Math.round((totals.complete / totals.total) * 100) : 0;
}

function overallDashboardSections() {
  const folderSections = orderedManualFolders().flatMap((folder) => dashboardSections(folder.data));
  return [projectDashboardSection(), ...folderSections];
}

function assetTotalsFromRows(rows = []) {
  const assets = rows
    .filter((row) => filled(row[0]) || filled(row[2]));
  const totalValue = assets.reduce((sum, row) => sum + moneyValue(row[15]) * (moneyValue(row[14]) || 1), 0);
  return {
    assetCount: assets.length,
    totalValue,
  };
}

function dashboardTotals() {
  const folders = orderedManualFolders();
  const allRows = folders.flatMap((folder) => folder.data.equipment || []);
  return {
    overall: assetTotalsFromRows(allRows),
    selected: assetTotalsFromRows(currentManual().equipment || []),
  };
}

function renderDashboard() {
  const target = document.querySelector("#dashboardContent");
  if (!target) return;
  const sections = dashboardSections();
  const totals = dashboardTotals();
  const selectedPercent = completionFromSections(sections);
  const overallPercent = completionFromSections(overallDashboardSections());
  const selectedLabel = folderDisplayName(ensureActiveFolder());
  target.innerHTML = `
    <div class="dashboard-stats">
      <div class="dashboard-stat completion-stat">
        <div>
          <span>Overall manual complete</span>
          <small>All manual folders</small>
        </div>
        <div class="dashboard-donut large ${completionClass(overallPercent)}" style="--percent: ${overallPercent}">
          <strong>${overallPercent}%</strong>
        </div>
      </div>
      <div class="dashboard-stat completion-stat">
        <div>
          <span>Selected folder complete</span>
          <small>${escapeHtml(selectedLabel)}</small>
        </div>
        <div class="dashboard-donut large ${completionClass(selectedPercent)}" style="--percent: ${selectedPercent}">
          <strong>${selectedPercent}%</strong>
        </div>
      </div>
      <div class="dashboard-stat">
        <span>Total assets</span>
        <strong>${totals.overall.assetCount}</strong>
        <small>All manual folders</small>
      </div>
      <div class="dashboard-stat">
        <span>Total asset value</span>
        <strong>${currencyAu(totals.overall.totalValue)}</strong>
        <small>All manual folders</small>
      </div>
      <div class="dashboard-stat">
        <span>Selected assets</span>
        <strong>${totals.selected.assetCount}</strong>
        <small>${escapeHtml(selectedLabel)}</small>
      </div>
      <div class="dashboard-stat">
        <span>Selected asset value</span>
        <strong>${currencyAu(totals.selected.totalValue)}</strong>
        <small>${escapeHtml(selectedLabel)}</small>
      </div>
    </div>
    <div class="dashboard-grid">
      ${sections
        .map(
          (section) => `
            <article class="dashboard-card">
              <div class="dashboard-card-head">
                <h3>${section.label}</h3>
                <div class="dashboard-donut ${completionClass(section.percent)}" style="--percent: ${section.percent}">
                  <strong>${section.percent}%</strong>
                </div>
              </div>
              <div class="dashboard-progress" aria-label="${section.label} ${section.percent}% complete">
                <span style="width: ${section.percent}%"></span>
              </div>
              <p>${section.percent === 100 ? "Done" : "Outstanding"}</p>
              <ul>
                ${section.outstanding.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderEditors() {
  const manual = currentManual();
  projectFieldNames.forEach((name) => {
    if (name === "projectImage") return;
    const field = document.querySelector(`[name="${name}"]`);
    if (field && field.value !== state.fields[name]) field.value = state.fields[name] || "";
  });
  sectionFieldNames.forEach((name) => {
    const field = document.querySelector(`[name="${name}"]`);
    if (field && field.value !== manual.fields[name]) field.value = manual.fields[name] || "";
  });
  renderSiteDetailsTree();
  renderServiceClassificationTable();
  createTableRows("contacts", manual.contacts);
  createTableRows("equipment", manual.equipment);
  createTableRows("maintenance", manual.maintenance);
  createTableRows("commissioning", manual.commissioning);
  createTableRows("warranties", manual.warranties);
  createTableRows("certificates", manual.certificates);
  createTableRows("asBuilts", manual.asBuilts);
  createTableRows("documents", manual.documents);
  renderAssetIdDatalist();
  renderUnitDatalist();
  renderTradeDatalist();
  renderSiteDetailDatalists();
  renderLinkedAssetDescriptionCells();
  renderProjectImagePreview();
  renderDashboard();
}

function renderProjectImagePreview() {
  const preview = document.querySelector("#projectImagePreview");
  if (!preview) return;
  if (!state.fields.projectImage) {
    preview.textContent = "No image selected";
    preview.classList.remove("has-image");
    return;
  }
  preview.classList.add("has-image");
  preview.innerHTML = `<img src="${state.fields.projectImage}" alt="Selected project preview" />`;
}

function tableHtml(headers, rows, detail = {}) {
  if (!rows.length) return '<p class="empty-note">No records added.</p>';
  const attachmentIndex = headers.indexOf("Attached Document");
  return `
    <table>
      <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows
          .map(
            (row, rowIndex) => `
              <tr>
                ${row
                  .map((cell, index) =>
                    `<td>${
                      index === attachmentIndex && cell
                        ? attachmentButton(cell, {
                            section: detail.section || row[0] || "Attachment",
                            listName: detail.listName || "",
                            assetId: row[1] || "",
                            record: row[2] || "",
                            rowIndex,
                          })
                        : textOrDash(cell)
                    }</td>`,
                  )
                  .join("")}
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function attachmentButton(name, detail = {}) {
  return `
    <button
      class="attachment-link"
      type="button"
      data-attachment-name="${escapeHtml(name)}"
      data-attachment-list="${escapeHtml(detail.listName || "")}"
      data-attachment-row="${escapeHtml(detail.rowIndex ?? "")}"
      data-attachment-section="${escapeHtml(detail.section || "")}"
      data-attachment-asset="${escapeHtml(detail.assetId || "")}"
      data-attachment-record="${escapeHtml(detail.record || "")}"
    >${escapeHtml(name)}</button>
  `;
}

function assetRegisterHtml(rows, prefix = "asset") {
  if (!rows.length) return '<p class="empty-note">No records added.</p>';
  const labelValue = (label, value) => `
    <th>${label}</th>
    <td>${textOrDash(value)}</td>
  `;
  const labelHtml = (label, value) => `
    <th>${label}</th>
    <td>${value}</td>
  `;
  return rows
    .map(
      (row, index) => `
        <table class="asset-register-table" id="${assetAnchor(row[0], index, prefix)}">
          <tbody>
            <tr>${labelHtml("Asset ID", `<span class="asset-anchor">${textOrDash(row[0])}</span>`)}${labelValue("Parent Asset ID", row[1])}</tr>
            <tr>${labelValue("Description", row[2])}${labelValue("Make", row[10])}</tr>
            <tr>${labelValue("Service Name", row[3])}${labelValue("Model", row[11])}</tr>
            <tr>${labelValue("Subservice", row[4])}${labelValue("Serial Number", row[12])}</tr>
            <tr>${labelValue("Site Name", row[5])}${labelValue("Supplier", row[13])}</tr>
            <tr>${labelValue("Structure", row[6])}${labelValue("Quantity", row[14])}</tr>
            <tr>${labelValue("Level Name", row[7])}${labelValue("Retail Price $", row[15])}</tr>
            <tr>${labelValue("Space Name", row[8])}${labelValue("Install Date", row[16])}</tr>
            <tr>${labelValue("Location Description", row[9])}${labelValue("Wty Expiry Date", row[17])}</tr>
            <tr>${labelValue("Life Expectancy (yrs)", row[18])}${labelValue("Updated Date", row[20])}</tr>
            <tr>${labelValue("Updated User", row[21])}<th></th><td></td></tr>
            <tr>
              <th>Reference Information</th>
              <td colspan="3">${textOrDash(row[19])}</td>
            </tr>
          </tbody>
        </table>
      `,
    )
    .join("");
}

function maintenanceScheduleHtml(manual, prefix = "asset") {
  if (!manual.maintenance.length) return '<p class="empty-note">No records added.</p>';
  const anchorMap = new Map();
  const descriptions = assetDescriptions(manual);
  manual.equipment.forEach((row, index) => {
    if (row[0] && !anchorMap.has(row[0])) anchorMap.set(row[0], assetAnchor(row[0], index, prefix));
  });
  return `
    <table>
      <thead>
        <tr>
          ${["Asset ID", "Frequency", "Unit", "Routine", "Details"].map((header) => `<th>${header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${manual.maintenance
          .map((row) => {
            const assetCell = anchorMap.has(row[0])
              ? `<a class="xref-link" href="#${anchorMap.get(row[0])}">${textOrDash(row[0])}</a>`
              : textOrDash(row[0]);
            return `
              <tr>
                <td>${assetCell}</td>
                <td>${textOrDash(descriptions.get(row[0]))}</td>
                ${row
                  .slice(1)
                  .map((cell, index) => {
                    const columnIndex = index + 1;
                    return `<td>${
                      columnIndex === 5
                        ? attachmentButton(cell, {
                            section: "Warranties",
                            assetId: row[0] || "",
                            record: descriptions.get(row[0]) || "",
                          })
                        : textOrDash(cell)
                    }</td>`;
                  })
                  .join("")}
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function warrantiesHtml(manual, prefix = "asset") {
  if (!manual.warranties.length) return '<p class="empty-note">No records added.</p>';
  const anchorMap = new Map();
  const descriptions = assetDescriptions(manual);
  manual.equipment.forEach((row, index) => {
    if (row[0] && !anchorMap.has(row[0])) anchorMap.set(row[0], assetAnchor(row[0], index, prefix));
  });
  return `
    <table>
      <thead>
        <tr>
          ${["Asset ID", "Description", "Provider", "Start", "Expiry", "Conditions / Claim Details", "Attached Document"].map((header) => `<th>${header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${manual.warranties
          .map((row, rowIndex) => {
            const assetCell = anchorMap.has(row[0])
              ? `<a class="xref-link" href="#${anchorMap.get(row[0])}">${textOrDash(row[0])}</a>`
              : textOrDash(row[0]);
            return `
              <tr>
                <td>${assetCell}</td>
                <td>${textOrDash(descriptions.get(row[0]))}</td>
                ${row
                  .slice(1)
                  .map((cell, index) => {
                    const columnIndex = index + 1;
                    return `<td>${
                      columnIndex === 5
                        ? attachmentButton(cell, {
                            section: "Warranties",
                            listName: "warranties",
                            rowIndex,
                            assetId: row[0] || "",
                            record: descriptions.get(row[0]) || "",
                          })
                        : textOrDash(cell)
                    }</td>`;
                  })
                  .join("")}
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function appendicesHtml(manual) {
  const descriptions = assetDescriptions(manual);
  const rows = [];
  manual.warranties.forEach((row, rowIndex) => {
    if (!row[5]) return;
    rows.push([
      "Warranties",
      row[0] || "",
      descriptions.get(row[0]) || "",
      row[5],
      "warranties",
      rowIndex,
    ]);
  });
  manual.certificates.forEach((row, rowIndex) => {
    if (!row[5]) return;
    rows.push([
      "Certificates",
      "",
      [row[0], row[1]].filter(Boolean).join(" - "),
      row[5],
      "certificates",
      rowIndex,
    ]);
  });
  if (!rows.length) return '<p class="empty-note">No records added.</p>';
  return `
    <table>
      <thead>
        <tr>
          ${["Section", "Asset ID", "Asset / Record", "Attached Document"].map((header) => `<th>${header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${textOrDash(row[0])}</td>
                <td>${textOrDash(row[1])}</td>
                <td>${textOrDash(row[2])}</td>
                <td>${attachmentButton(row[3], {
                  section: row[0],
                  assetId: row[1],
                  record: row[2],
                  listName: row[4],
                  rowIndex: row[5],
                })}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

const manualSections = [
  ["toc-introduction", "Introduction"],
  ["toc-key-contacts", "Contacts"],
  ["toc-assets", "Assets"],
  ["toc-technical-data", "Technical"],
  ["toc-maintenance", "Maintenance"],
  ["toc-commissioning", "Commissioning"],
  ["toc-warranties", "Warranties"],
  ["toc-certificates", "Certificates"],
  ["toc-safety", "Safety"],
  ["toc-emergency", "Emergency"],
  ["toc-spare-parts", "Spares"],
  ["toc-as-builts", "As Builts"],
  ["toc-documents", "Documents"],
  ["toc-appendices", "Appendices"],
];

function folderDisplayName(folder) {
  return [folder.discipline, folder.trade, folder.subTrade].filter(Boolean).join(" / ");
}

function tableOfContentsHtml(folders) {
  const manualFolders = (folders?.length ? [...folders] : [ensureActiveFolder()]).sort((a, b) =>
    folderDisplayName(a).localeCompare(folderDisplayName(b)),
  );
  const isFullManual = manualFolders.length > 1;
  return `
    <nav class="manual-toc" aria-label="Table of contents">
      <h2>${isFullManual ? "Master Table of Contents" : "Table of Contents"}</h2>
      ${manualFolders
        .map(
          (folder) => `
            <section class="manual-toc-folder">
              <h3><a href="#${folderAnchor(folder)}">${escapeHtml(folderDisplayName(folder))}</a></h3>
              <div class="manual-toc-links">
                ${manualSections
                  .map(([id, title]) => `<a href="#${sectionAnchor(folder, id)}">${escapeHtml(title)}</a>`)
                  .join("")}
              </div>
            </section>
          `,
        )
        .join("")}
    </nav>
  `;
}

function folderManualHtml(folder) {
  const f = folder.data.fields;
  const prefix = folderAnchor(folder);
  return `
    <section class="folder-tree manual-folder">
      ${anchorTarget(prefix)}
      <h2 class="folder-heading">${escapeHtml(folderDisplayName(folder))}</h2>

      <div class="folder-content">
        ${anchorTarget(sectionAnchor(folder, "toc-introduction"))}
        <h5>1. Introduction & Scope</h5>
        <h6>Introduction</h6>
        ${paragraph(f.introduction)}
        <h6>Scope of Works</h6>
        ${paragraph(f.scopeOfWorks)}

        ${anchorTarget(sectionAnchor(folder, "toc-key-contacts"))}
        <h5>2. Key Contacts</h5>
        ${tableHtml(["Company Name", "Trade", "Address", "Phone Numbers", "Emails", "Website"], folder.data.contacts)}

        <section class="asset-register-print-section">
          ${anchorTarget(sectionAnchor(folder, "toc-assets"))}
          <h5>3. Assets Register</h5>
          ${assetRegisterHtml(folder.data.equipment, prefix)}
        </section>

        ${anchorTarget(sectionAnchor(folder, "toc-technical-data"))}
        <h5>4. Operations and Technical Data</h5>
        <h6>Operating Instructions</h6>
        ${paragraph(f.operatingInstructions)}
        <h6>Technical Data</h6>
        ${paragraph(f.technicalData)}

        ${anchorTarget(sectionAnchor(folder, "toc-maintenance"))}
        <h5>5. Maintenance Schedule</h5>
        ${maintenanceScheduleHtml(folder.data, prefix)}

        ${anchorTarget(sectionAnchor(folder, "toc-commissioning"))}
        <h5>6. Commissioning</h5>
        ${paragraph(f.commissioningSummary)}
        ${tableHtml(["Asset / System", "Test / Activity", "Date", "Result", "Witness / Sign-off"], folder.data.commissioning)}

        ${anchorTarget(sectionAnchor(folder, "toc-warranties"))}
        <h5>7. Warranties</h5>
        ${warrantiesHtml(folder.data, prefix)}

        ${anchorTarget(sectionAnchor(folder, "toc-certificates"))}
        <h5>8. Certificates</h5>
        ${tableHtml(["Certificate Type", "Reference", "Issued By", "Issue Date", "Notes", "Attached Document"], folder.data.certificates, {
          listName: "certificates",
          section: "Certificates",
        })}

        ${anchorTarget(sectionAnchor(folder, "toc-safety"))}
        <h5>9. Safety Requirements</h5>
        ${paragraph(f.safetyRequirements)}

        ${anchorTarget(sectionAnchor(folder, "toc-emergency"))}
        <h5>10. Emergency Procedures</h5>
        ${paragraph(f.emergencyProcedures)}

        ${anchorTarget(sectionAnchor(folder, "toc-spare-parts"))}
        <h5>11. Spare Parts</h5>
        ${paragraph(f.spareParts)}

        ${anchorTarget(sectionAnchor(folder, "toc-as-builts"))}
        <h5>12. As Builts</h5>
        ${tableHtml(["Drawing / Model", "Revision", "Date", "Location / Reference", "Notes"], folder.data.asBuilts)}

        ${anchorTarget(sectionAnchor(folder, "toc-documents"))}
        <h5>13. Documents and References</h5>
        ${tableHtml(["Type", "Title", "Reference / Location", "Notes"], folder.data.documents)}

        ${anchorTarget(sectionAnchor(folder, "toc-appendices"))}
        <h5>14. Appendices</h5>
        ${appendicesHtml(folder.data)}
      </div>
    </section>
  `;
}

function manualLogoHtml() {
  return `
    <div class="manual-logo" aria-hidden="true">
      <svg viewBox="0 0 96 96" role="img">
        <path class="logo-building" d="M52 16h28v64H52zM58 24h6v7h-6zM69 24h6v7h-6zM58 37h6v7h-6zM69 37h6v7h-6zM58 50h6v7h-6zM69 50h6v7h-6zM61 66h12v14H61z" />
        <path class="logo-person" d="M28 21a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM15 79l4-29c1-6 5-10 11-10h1c5 0 9 3 11 8l3 9 12 5-4 8-15-6-4-10-3 25z" />
        <path class="logo-manual" d="M42 45l23 7-5 22-23-7zM47 53l12 4M45 60l12 4" />
      </svg>
    </div>
  `;
}

function manualCoverHtml(detail = {}) {
  const active = detail.activeFolder || ensureActiveFolder();
  const folderMeta = detail.folderCount
    ? `${detail.folderCount} discipline / trade folders included`
    : folderDisplayName(active);
  const folderLabel = detail.folderCount ? "Manual scope" : "Selected virtual folder";
  return `
    <section class="manual-cover">
      <div class="manual-cover-brand">
        ${manualLogoHtml()}
        <div>
          <p class="eyebrow">Operations and Maintenance Manual</p>
          <h1>${textOrDash(state.fields.projectName)}</h1>
        </div>
      </div>
      <div class="meta-grid">
        <div class="meta-item"><span class="label">Client</span>${textOrDash(state.fields.clientName)}</div>
        <div class="meta-item"><span class="label">Site</span>${textOrDash(state.fields.siteAddress)}</div>
        <div class="meta-item"><span class="label">Prepared by</span>${textOrDash(state.fields.preparedBy)}</div>
        <div class="meta-item"><span class="label">Revision</span>${textOrDash(state.fields.revision)}</div>
        <div class="meta-item"><span class="label">Handover date</span>${textOrDash(state.fields.handoverDate)}</div>
        <div class="meta-item"><span class="label">Generated</span>${new Date().toLocaleDateString("en-AU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}</div>
        <div class="meta-item folder-meta"><span class="label">${folderLabel}</span>${textOrDash(folderMeta)}</div>
      </div>
      ${
        state.fields.projectImage
          ? `<figure class="manual-project-image"><img src="${state.fields.projectImage}" alt="Project image" /></figure>`
          : ""
      }
      <section class="manual-project-summary" id="manual-project-summary">
        <h2>Project Summary</h2>
        ${paragraph(state.fields.projectSummary)}
      </section>
    </section>
  `;
}

function fullManualHtml(options = {}) {
  const folders = orderedManualFolders();
  const includeToc = options.includeToc !== false;
  return `
    <div class="manual full-manual">
      ${manualCoverHtml({ folderCount: folders.length })}
      ${includeToc ? tableOfContentsHtml(folders) : ""}
      ${folders.map((folder) => folderManualHtml(folder)).join("")}
    </div>
  `;
}

function renderPreview() {
  const preview = document.querySelector("#manualPreview");
  const active = ensureActiveFolder();
  preview.innerHTML = `
    <div class="manual">
      ${manualCoverHtml({ activeFolder: active })}
      ${tableOfContentsHtml([active])}
      ${folderManualHtml(active)}
    </div>
  `;
  wireAttachmentPreviewClicks();
}

function renderFullManualPreview(options = {}) {
  const preview = document.querySelector("#manualPreview");
  preview.innerHTML = fullManualHtml(options);
  wireAttachmentPreviewClicks();
}

function exportExcelWorkbook() {
  if (!spreadsheetReady()) {
    alert("Excel export needs the spreadsheet library. It will load when the app is hosted on GitHub Pages with internet access.");
    return;
  }

  const workbook = XLSX.utils.book_new();
  const projectHeaders = spreadsheetColumns.project.map(([, label]) => label);
  XLSX.utils.book_append_sheet(
    workbook,
    sheetFromObjects(projectHeaders, [
      Object.fromEntries(spreadsheetColumns.project.map(([key, label]) => [label, state.fields[key] || ""])),
    ]),
    "Project Details",
  );

  const folderHeaders = folderColumns();
  const folders = orderedManualFolders();
  XLSX.utils.book_append_sheet(workbook, sheetFromObjects(folderHeaders, folders.map(folderRow)), "Folder Structure");

  const siteHeaders = spreadsheetColumns.siteDetails.map(([, label]) => label);
  XLSX.utils.book_append_sheet(
    workbook,
    sheetFromObjects(siteHeaders, (state.siteDetails || []).map((row) => rowFromArray(spreadsheetColumns.siteDetails, row))),
    "Site Details",
  );

  XLSX.utils.book_append_sheet(
    workbook,
    sheetFromObjects(["Service Name", "Sub Service"], (state.serviceClassifications || []).map(([service, subservice]) => ({
      "Service Name": service || "",
      "Sub Service": subservice || "",
    }))),
    "Service Classifications",
  );

  const sectionHeaders = [...folderColumns(), ...spreadsheetColumns.sections.map(([, label]) => label)];
  XLSX.utils.book_append_sheet(
    workbook,
    sheetFromObjects(
      sectionHeaders,
      folders.map((folder) => ({
        ...folderRow(folder),
        ...Object.fromEntries(spreadsheetColumns.sections.map(([key, label]) => [label, folder.data.fields[key] || ""])),
      })),
    ),
    "Sections",
  );

  spreadsheetSheets.forEach(([sheetName, listName]) => {
    const listHeaders = [...folderColumns(), ...spreadsheetColumns[listName].map(([, label]) => label)];
    const rows = folders.flatMap((folder) =>
      (folder.data[listName] || []).map((row) => ({
        ...folderRow(folder),
        ...rowFromArray(spreadsheetColumns[listName], row),
      })),
    );
    XLSX.utils.book_append_sheet(workbook, sheetFromObjects(listHeaders, rows), sheetName);
  });

  XLSX.writeFile(workbook, "om-manual-builder-template.xlsx");
}

function importExcelWorkbook(workbook) {
  const next = cloneData(defaults);
  next.fields = { ...cloneData(defaults.fields) };
  next.siteDetails = [];
  next.folders = {};

  const projectRow = readSheetRows(workbook, "Project Details")[0] || {};
  spreadsheetColumns.project.forEach(([key, label]) => {
    next.fields[key] = projectRow[label] || "";
  });

  next.siteDetails = readSheetRows(workbook, "Site Details")
    .map((row) => arrayFromRow(spreadsheetColumns.siteDetails, row))
    .filter((row) => row.some(Boolean))
    .map(normalizeSiteDetailRow);

  const importedClassifications = readSheetRows(workbook, "Service Classifications")
    .map((row) => [row["Service Name"] || "", row["Sub Service"] || ""])
    .filter((row) => row.some(Boolean))
    .map(normalizeServiceClassificationRow);
  next.serviceClassifications = importedClassifications.length ? importedClassifications : cloneData(defaultServiceClassifications);

  readSheetRows(workbook, "Folder Structure").forEach((row) => {
    const folder = rowFolder(row);
    next.folders[folderKey(folder)] = { ...folder, data: mergeSectionData() };
  });

  readSheetRows(workbook, "Sections").forEach((row) => {
    const folder = rowFolder(row);
    const key = folderKey(folder);
    if (!next.folders[key]) next.folders[key] = { ...folder, data: mergeSectionData() };
    spreadsheetColumns.sections.forEach(([fieldKey, label]) => {
      next.folders[key].data.fields[fieldKey] = row[label] || "";
    });
  });

  spreadsheetSheets.forEach(([sheetName, listName]) => {
    readSheetRows(workbook, sheetName).forEach((row) => {
      const folder = rowFolder(row);
      const key = folderKey(folder);
      if (!next.folders[key]) next.folders[key] = { ...folder, data: mergeSectionData() };
      const values = arrayFromRow(spreadsheetColumns[listName], row);
      if (values.some(Boolean)) next.folders[key].data[listName].push(values);
    });
  });

  if (!Object.keys(next.folders).length) {
    const folder = cleanFolder(next.selectedFolder);
    next.folders[folderKey(folder)] = { ...folder, data: mergeSectionData() };
  }
  next.selectedFolder = cleanFolder(Object.values(next.folders)[0] || next.selectedFolder);
  state = next;
  renderFolderPicker();
  renderEditors();
  persistAndRender();
}

function wireAttachmentPreviewClicks() {
  document.querySelectorAll(".attachment-link").forEach((button) => {
    button.addEventListener("click", () => {
      const url = getAttachmentUrl(
        button.dataset.attachmentList || "",
        button.dataset.attachmentRow || "",
        button.dataset.attachmentName || "",
      );
      if (url) {
        openAttachmentUrl(url);
        return;
      }
      const lines = [
        `Attached document: ${button.dataset.attachmentName || "Not provided"}`,
        button.dataset.attachmentSection ? `Section: ${button.dataset.attachmentSection}` : "",
        button.dataset.attachmentAsset ? `Asset ID: ${button.dataset.attachmentAsset}` : "",
        button.dataset.attachmentRecord ? `Record: ${button.dataset.attachmentRecord}` : "",
        "The file name is saved, but the browser cannot reopen the actual file after a refresh.",
        "Go back to the matching Warranties or Certificates row, choose the file again, then click the attachment link in the preview.",
      ].filter(Boolean);
      alert(lines.join("\n"));
    });
  });
}

function persistAndRender() {
  markSaving();
  saveState();
  renderDashboard();
  renderPreview();
}

function updatePreviewToggleButton() {
  const button = document.querySelector("#togglePreview");
  if (!button) return;
  const hidden = document.body.classList.contains("preview-hidden");
  button.textContent = hidden ? "Show Preview" : "Hide Preview";
  button.setAttribute("aria-pressed", String(hidden));
}

function handleNamedFieldInput(field) {
  if (!field?.name) return false;
  if (projectFieldNames.includes(field.name)) {
    state.fields[field.name] = field.value;
  } else if (sectionFieldNames.includes(field.name)) {
    currentManual().fields[field.name] = field.value;
  } else {
    return false;
  }
  persistAndRender();
  return true;
}

document.addEventListener("input", (event) => {
  handleNamedFieldInput(event.target);
});

document.querySelector("#manualForm").addEventListener("submit", (event) => {
  event.preventDefault();
});

document.querySelector("#projectImageInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.fields.projectImage = String(reader.result || "");
    renderProjectImagePreview();
    persistAndRender();
  });
  reader.readAsDataURL(file);
});

document.querySelector("#clearProjectImage").addEventListener("click", () => {
  state.fields.projectImage = "";
  document.querySelector("#projectImageInput").value = "";
  renderProjectImagePreview();
  persistAndRender();
});

document.querySelector("#togglePreview").addEventListener("click", () => {
  document.body.classList.toggle("preview-hidden");
  updatePreviewToggleButton();
});

document.querySelector("#openAdministration").addEventListener("click", () => {
  const settingsPanel = document.querySelector('[data-panel="settings"]');
  if (!settingsPanel) return;
  document.body.classList.add("settings-open");
  document.querySelectorAll(".tab, .panel").forEach((element) => element.classList.remove("active"));
  settingsPanel.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderPreview();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab);
  });
});

document.querySelectorAll(".add-row").forEach((button) => {
  button.addEventListener("click", () => {
    const listName = button.dataset.list;
    const targetData = listName === "siteDetails" ? state.siteDetails : currentManual()[listName];
    targetData.push(listColumns[listName].map(() => ""));
    renderEditors();
    persistAndRender();
  });
});

document.querySelector("#disciplineSelect").addEventListener("change", (event) => {
  const discipline = event.target.value;
  const firstTrade = uniqueFolderValues(folderList().filter((folder) => folder.discipline === discipline), "trade")[0] || "";
  const firstSubTrade = uniqueFolderValues(
    folderList().filter((folder) => folder.discipline === discipline && folder.trade === firstTrade),
    "subTrade",
  )[0] || "";
  selectExistingFolder({ discipline, trade: firstTrade, subTrade: firstSubTrade });
});

document.querySelector("#tradeSelect").addEventListener("change", (event) => {
  const trade = event.target.value;
  const firstSubTrade = uniqueFolderValues(
    folderList().filter((folder) => folder.discipline === state.selectedFolder.discipline && folder.trade === trade),
    "subTrade",
  )[0] || "";
  selectExistingFolder({ discipline: state.selectedFolder.discipline, trade, subTrade: firstSubTrade });
});

document.querySelector("#subTradeSelect").addEventListener("change", (event) => {
  selectExistingFolder({
    discipline: state.selectedFolder.discipline,
    trade: state.selectedFolder.trade,
    subTrade: event.target.value,
  });
});

document.querySelector("#addFolderPath").addEventListener("click", () => {
  const folder = cleanFolder({
    discipline: document.querySelector("#newDiscipline").value,
    trade: document.querySelector("#newTrade").value,
    subTrade: document.querySelector("#newSubTrade").value,
  });
  state.selectedFolder = createFolder(folder);
  ["#newDiscipline", "#newTrade", "#newSubTrade"].forEach((selector) => {
    document.querySelector(selector).value = "";
  });
  renderFolderPicker();
  renderEditors();
  persistAndRender();
});

document.querySelector("#updateFolderPath").addEventListener("click", () => {
  renameSelectedFolder();
});

function addSiteDetailPathFromFields() {
  const fields = [
    document.querySelector("#siteDetailSite"),
    document.querySelector("#siteDetailStructure"),
    document.querySelector("#siteDetailLevel"),
    document.querySelector("#siteDetailSpace"),
    document.querySelector("#siteDetailDescription"),
  ];
  if (fields.some((field) => !field)) return;
  const row = fields.map((field) => field.value.trim());
  if (addSiteDetailRow(row)) {
    selectedSiteDetailPath = {
      site: row[0] || "",
      structure: row[1] || "",
      level: row[2] || "",
      space: row[3] || "",
    };
    fields.forEach((field) => {
      field.value = "";
    });
    renderSiteDetailsTree();
  }
}

document.querySelector("#addSiteDetailPath").addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  addSiteDetailPathFromFields();
});

function addServiceClassificationValue(service, subservice = "") {
  const row = normalizeServiceClassificationRow([service, subservice]);
  if (!row[0]) return;
  if (!Array.isArray(state.serviceClassifications)) state.serviceClassifications = [];
  const exists = state.serviceClassifications.some((item) => {
    const normal = normalizeServiceClassificationRow(item);
    return normal[0] === row[0] && normal[1] === row[1];
  });
  if (!exists) state.serviceClassifications.push(row);
  selectedServiceClassification = row[0];
  renderServiceClassificationTable();
  renderEditors();
  persistAndRender();
}

document.addEventListener("click", (event) => {
  const serviceSelect = event.target.closest(".service-classification-select");
  if (serviceSelect) {
    event.preventDefault();
    selectedServiceClassification = serviceSelect.dataset.serviceName || "";
    renderServiceClassificationTable();
    return;
  }
  if (event.target.closest("#addServiceClassification")) {
    event.preventDefault();
    addServiceClassificationValue(document.querySelector("#newServiceName")?.value.trim() || "");
    return;
  }
  if (event.target.closest("#addSubServiceClassification")) {
    event.preventDefault();
    addServiceClassificationValue(selectedServiceClassification, document.querySelector("#newSubService")?.value.trim() || "");
    return;
  }
  const serviceRemove = event.target.closest(".remove-service-classification");
  if (serviceRemove) {
    event.preventDefault();
    const serviceToRemove = serviceRemove.dataset.serviceNameRemove;
    const subserviceToRemove = serviceRemove.dataset.subService;
    const rowService = serviceRemove.dataset.serviceName;
    if (serviceToRemove) {
      state.serviceClassifications = (state.serviceClassifications || []).filter((row) => normalizeServiceClassificationRow(row)[0] !== serviceToRemove);
      if (selectedServiceClassification === serviceToRemove) selectedServiceClassification = "";
    } else {
      state.serviceClassifications = (state.serviceClassifications || []).filter((row) => {
        const normal = normalizeServiceClassificationRow(row);
        return !(normal[0] === rowService && normal[1] === subserviceToRemove);
      });
    }
    renderServiceClassificationTable();
    renderEditors();
    persistAndRender();
    return;
  }
  const siteUse = event.target.closest(".site-use");
  if (siteUse) {
    event.preventDefault();
    fillSiteDetailFields(payloadFromSiteButton(siteUse));
    return;
  }
  const siteAdd = event.target.closest(".site-add");
  if (siteAdd) {
    event.preventDefault();
    handleSiteTreeAdd(siteAdd);
    return;
  }
  if (event.target.closest("#addSiteDetailPath")) {
    event.preventDefault();
    addSiteDetailPathFromFields();
  }
});

document.querySelector("#projectDatabaseSelect").addEventListener("change", (event) => {
  document.querySelector("#projectDatabaseName").value = event.target.value;
});

document.querySelector("#newProjectRecord").addEventListener("click", () => {
  if (!confirm("Start a new blank project? Save the current project first if you need to keep it.")) return;
  state = cloneData(defaults);
  createFolder(state.selectedFolder);
  renderFolderPicker();
  renderEditors();
  persistAndRender();
  renderProjectDatabaseControls("");
});

document.querySelector("#saveProjectRecord").addEventListener("click", () => {
  saveCurrentProjectRecord();
});

document.querySelector("#openProjectRecord").addEventListener("click", () => {
  const name = document.querySelector("#projectDatabaseSelect").value || document.querySelector("#projectDatabaseName").value.trim();
  if (!name) return alert("Select a saved project first.");
  if (!confirm("Open this project? Unsaved changes in the current draft will be replaced.")) return;
  loadProjectRecord(name);
});

document.querySelector("#duplicateProjectRecord").addEventListener("click", () => {
  const baseName = projectDatabaseName();
  const copyName = `${baseName} Copy`;
  document.querySelector("#projectDatabaseName").value = copyName;
  saveCurrentProjectRecord(copyName);
});

document.querySelector("#deleteProjectRecord").addEventListener("click", () => {
  const name = document.querySelector("#projectDatabaseSelect").value || document.querySelector("#projectDatabaseName").value.trim();
  if (!name) return alert("Select a saved project first.");
  if (!confirm(`Delete saved project "${name}"? This cannot be undone.`)) return;
  const database = loadProjectDatabase();
  delete database[name];
  if (saveProjectDatabase(database)) renderProjectDatabaseControls("");
});

document.querySelector("#exportExcel").addEventListener("click", () => {
  exportExcelWorkbook();
});

document.querySelector("#importExcel").addEventListener("click", () => {
  if (!spreadsheetReady()) {
    alert("Excel import needs the spreadsheet library. It will load when the app is hosted on GitHub Pages with internet access.");
    return;
  }
  document.querySelector("#excelFileInput").click();
});

document.querySelector("#excelFileInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!confirm("Importing this Excel workbook will replace the current draft in this browser. Continue?")) {
    event.target.value = "";
    return;
  }
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { cellDates: true });
    importExcelWorkbook(workbook);
  } catch (error) {
    alert(`Excel import failed: ${error.message || "Check the workbook format and try again."}`);
  } finally {
    event.target.value = "";
  }
});

document.querySelector("#loadSample").addEventListener("click", () => {
  state = buildSampleManualData();
  renderFolderPicker();
  renderEditors();
  persistAndRender();
});

document.querySelector("#clearDraft").addEventListener("click", () => {
  if (!confirm("Clear all O&M manual information from this browser?")) return;
  state = cloneData(defaults);
  createFolder(state.selectedFolder);
  renderFolderPicker();
  renderEditors();
  persistAndRender();
});

document.querySelector("#printManual").addEventListener("click", () => {
  renderFullManualPreview({
    includeToc: document.querySelector("#includeToc")?.checked !== false,
  });
  window.print();
});

window.addEventListener("afterprint", () => {
  renderPreview();
});

try {
  state = loadState();
  ensureActiveFolder();
  addSectionNavigationButtons();
  renderFolderPicker();
  renderEditors();
  renderProjectDatabaseControls("");
  renderPreview();
  updatePreviewToggleButton();
  saveState();
} catch (error) {
  showAppError(error.message || "The app could not finish loading.");
}
