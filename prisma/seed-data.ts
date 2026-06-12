export interface SeedCategory {
  name: string;
  description: string;
}

export interface SeedProduct {
  productCode: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stockQuantity?: number;
  categoryName: string;
  aliases?: string[];
}

export const seedCategories: SeedCategory[] = [
  {
    name: "Plumbing",
    description: "Pipes, fittings, taps, and sanitary items",
  },
  {
    name: "Electrical",
    description: "Wires, switches, MCBs, and lighting",
  },
  {
    name: "Hardware",
    description: "Locks, hinges, fasteners, and general hardware",
  },
  {
    name: "Building Materials",
    description: "Cement, sand, blocks, and construction supplies",
  },
  {
    name: "Paints",
    description: "Interior, exterior paints and painting accessories",
  },
  {
    name: "Tools",
    description: "Hand tools and power tool accessories",
  },
];

export const seedProducts: SeedProduct[] = [
  // Plumbing
  {
    productCode: "PLB-PVC-20",
    name: "PVC Pipe 20mm",
    price: 85,
    unit: "PIECE",
    categoryName: "Plumbing",
    aliases: ["പി വി സി 20", "pvc 20", "pvc pipe 20mm"],
  },
  {
    productCode: "PLB-PVC-25",
    name: "PVC Pipe 25mm",
    price: 110,
    unit: "PIECE",
    categoryName: "Plumbing",
    aliases: ["പി വി സി 25", "pvc 25"],
  },
  {
    productCode: "PLB-PVC-32",
    name: "PVC Pipe 32mm",
    price: 165,
    unit: "PIECE",
    categoryName: "Plumbing",
    aliases: ["pvc 32", "പി വി സി 32"],
  },
  {
    productCode: "PLB-TAP-WS",
    name: "Wall Mixer Tap",
    price: 1250,
    unit: "PIECE",
    categoryName: "Plumbing",
    aliases: ["wall mixer", "ടാപ്"],
  },
  {
    productCode: "PLB-ELB-20",
    name: "PVC Elbow 20mm",
    price: 12,
    unit: "PIECE",
    categoryName: "Plumbing",
  },
  {
    productCode: "PLB-TEE-25",
    name: "PVC Tee 25mm",
    price: 18,
    unit: "PIECE",
    categoryName: "Plumbing",
  },
  {
    productCode: "PLB-TAPE",
    name: "Teflon Tape Roll",
    price: 25,
    unit: "PIECE",
    categoryName: "Plumbing",
    aliases: ["teflon", "ടെഫ്ലോൺ ടേപ്പ്"],
  },
  {
    productCode: "PLB-CPVC-20",
    name: "CPVC Pipe 20mm (Hot Water)",
    price: 195,
    unit: "PIECE",
    categoryName: "Plumbing",
  },

  // Electrical
  {
    productCode: "ELC-WIRE-1.0",
    name: "Copper Wire 1.0 sqmm (90m)",
    price: 1450,
    unit: "COIL",
    categoryName: "Electrical",
    aliases: ["wire 1.0", "കമ്പി 1.0"],
  },
  {
    productCode: "ELC-WIRE-2.5",
    name: "Copper Wire 2.5 sqmm (90m)",
    price: 3200,
    unit: "COIL",
    categoryName: "Electrical",
    aliases: ["wire 2.5", "കമ്പി 2.5"],
  },
  {
    productCode: "ELC-SW-6A",
    name: "Switch 6A One Way",
    price: 35,
    unit: "PIECE",
    categoryName: "Electrical",
    aliases: ["switch", "സ്വിച്ച്"],
  },
  {
    productCode: "ELC-SK-6A",
    name: "Socket 6A",
    price: 45,
    unit: "PIECE",
    categoryName: "Electrical",
    aliases: ["socket", "സോക്കറ്റ്"],
  },
  {
    productCode: "ELC-MCB-16A",
    name: "MCB 16A Single Pole",
    price: 185,
    unit: "PIECE",
    categoryName: "Electrical",
    aliases: ["mcb 16", "എം സി ബി"],
  },
  {
    productCode: "ELC-LED-9W",
    name: "LED Bulb 9W Cool White",
    price: 95,
    unit: "PIECE",
    categoryName: "Electrical",
    aliases: ["led bulb", "ബൾബ്"],
  },
  {
    productCode: "ELC-CONDUIT-20",
    name: "PVC Conduit Pipe 20mm",
    price: 75,
    unit: "PIECE",
    categoryName: "Electrical",
  },
  {
    productCode: "ELC-BOX-4M",
    name: "Modular Switch Box 4M",
    price: 55,
    unit: "PIECE",
    categoryName: "Electrical",
  },

  // Hardware
  {
    productCode: "HRD-LOCK-CT",
    name: "Door Lock Cylinder Type",
    price: 650,
    unit: "PIECE",
    categoryName: "Hardware",
    aliases: ["door lock", "ലോക്ക്"],
  },
  {
    productCode: "HRD-HINGE-4",
    name: "Butt Hinge 4 inch",
    price: 85,
    unit: "PAIR",
    categoryName: "Hardware",
    aliases: ["hinge", "ഹിഞ്ച്"],
  },
  {
    productCode: "HRD-SCREW-2",
    name: "Wood Screw 2 inch (100 pcs)",
    price: 120,
    unit: "PACK",
    categoryName: "Hardware",
  },
  {
    productCode: "HRD-ANCHOR-8",
    name: "Wall Anchor Bolt 8mm",
    price: 8,
    unit: "PIECE",
    categoryName: "Hardware",
  },
  {
    productCode: "HRD-HANDLE",
    name: "Main Door Handle Set",
    price: 890,
    unit: "SET",
    categoryName: "Hardware",
  },
  {
    productCode: "HRD-NAIL-3",
    name: "Mild Steel Nail 3 inch (1kg)",
    price: 95,
    unit: "KG",
    categoryName: "Hardware",
  },

  // Building Materials
  {
    productCode: "BLD-CEM-53",
    name: "Portland Cement 53 Grade (50kg)",
    price: 385,
    unit: "BAG",
    categoryName: "Building Materials",
    aliases: ["cement", "സിമൻ്റ്"],
  },
  {
    productCode: "BLD-SAND",
    name: "River Sand (per cft)",
    price: 55,
    unit: "CFT",
    categoryName: "Building Materials",
    aliases: ["sand", "മണൽ"],
  },
  {
    productCode: "BLD-BRICK",
    name: "Wire Cut Brick",
    price: 8,
    unit: "PIECE",
    categoryName: "Building Materials",
    aliases: ["brick", "ഇട്ടിക്ക"],
  },
  {
    productCode: "BLD-BLOCK-4",
    name: "Solid Concrete Block 4 inch",
    price: 42,
    unit: "PIECE",
    categoryName: "Building Materials",
  },
  {
    productCode: "BLD-ROD-8",
    name: "TMT Steel Rod 8mm",
    price: 68,
    unit: "KG",
    categoryName: "Building Materials",
    aliases: ["tmt 8", "ഇസ്പാത്ത്"],
  },
  {
    productCode: "BLD-ROD-12",
    name: "TMT Steel Rod 12mm",
    price: 66,
    unit: "KG",
    categoryName: "Building Materials",
    aliases: ["tmt 12"],
  },

  // Paints
  {
    productCode: "PNT-EMUL-1L",
    name: "Interior Emulsion Paint 1L (White)",
    price: 285,
    unit: "LITRE",
    categoryName: "Paints",
    aliases: ["emulsion", "പെയിൻ്റ്"],
  },
  {
    productCode: "PNT-ENAM-1L",
    name: "Synthetic Enamel Paint 1L",
    price: 320,
    unit: "LITRE",
    categoryName: "Paints",
  },
  {
    productCode: "PNT-PRMR-1L",
    name: "Wall Primer 1L",
    price: 195,
    unit: "LITRE",
    categoryName: "Paints",
    aliases: ["primer"],
  },
  {
    productCode: "PNT-BRUSH-4",
    name: "Paint Brush 4 inch",
    price: 65,
    unit: "PIECE",
    categoryName: "Paints",
  },
  {
    productCode: "PNT-THIN-1L",
    name: "Paint Thinner 1L",
    price: 110,
    unit: "LITRE",
    categoryName: "Paints",
  },

  // Tools
  {
    productCode: "TOL-HAMMER",
    name: "Claw Hammer 500g",
    price: 350,
    unit: "PIECE",
    categoryName: "Tools",
    aliases: ["hammer", "ചുറ്റിക"],
  },
  {
    productCode: "TOL-SCREWDR",
    name: "Screwdriver Set 6 pcs",
    price: 280,
    unit: "SET",
    categoryName: "Tools",
  },
  {
    productCode: "TOL-PLIER-7",
    name: "Combination Plier 7 inch",
    price: 220,
    unit: "PIECE",
    categoryName: "Tools",
    aliases: ["plier", "പ്ലയർ"],
  },
  {
    productCode: "TOL-MEASURE-5",
    name: "Measuring Tape 5m",
    price: 175,
    unit: "PIECE",
    categoryName: "Tools",
    aliases: ["tape measure"],
  },
  {
    productCode: "TOL-HACKSAW",
    name: "Hacksaw Frame with Blade",
    price: 195,
    unit: "PIECE",
    categoryName: "Tools",
  },
  {
    productCode: "TOL-LEVEL",
    name: "Spirit Level 24 inch",
    price: 450,
    unit: "PIECE",
    categoryName: "Tools",
  },
];
