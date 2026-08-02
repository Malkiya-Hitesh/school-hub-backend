const DISTRICTS = [
  'AHMEDABAD',
  'AMRELI',
  'ANAND',
  'ARVALLI',
  'BANASKANTHA',
  'BHARUCH',
  'BHAVNAGAR',
  'BOTAD',
  'CHHOTAUDEPUR',
  'DAHOD',
  'DANGS',
  'DEVBHUMIDWARKA',
  'GANDHINAGAR',
  'GIRSOMNATH',
  'JAMNAGAR',
  'JUNAGADH',
  'KACHCHH',
  'KHEDA',
  'MAHESANA',
  'MAHISAGAR',
  'MORBI',
  'NARMADA',
  'NAVSARI',
  'PANCHMAHALS',
  'PATAN',
  'PORBANDAR',
  'RAJKOT',
  'SABARKANTHA',
  'SURAT',
  'SURENDRANAGAR',
  'TAPI',
  'VADODARA',
  'VALSAD'
]

const DISTRICT_TALUKAS = {
    MAHESANA: [
      'SATLASANA',
      'MEHSANA',
      'BECHARAJI',
      'JOTANA',
      'VADNAGAR',
      'VISNAGAR',
      'KADI',
      'UNJHA',
      'KHERALU',
      'VIJAPUR'
    ],
    DANGS: [
      'SUBIR',
      'WAGHAI',
      'AHWA'
    ],
    BOTAD: [
      'RANPUR',
      'GADHADA',
      'BARVALA',
      'BOTAD'
    ],
    CHHOTAUDEPUR: [
      'NASWADI',
      'CHHOTAUDEPUR',
      'BODELI',
      'SANKHEDA',
      'JETPURPAVI',
      'KAWANT'
    ],
    SABARKANTHA: [
      'TALOD',
      'POSHINA',
      'VIJAYNAGAR',
      'HIMMATNAGAR',
      'KHEDBRAHMA',
      'VADALI',
      'IDAR',
      'PRANTIJ'
    ],
    MAHISAGAR: [
      'KADANA',
      'KHANPUR',
      'VIRPUR',
      'LUNAWADA',
      'SANTRAMPUR',
      'BALASINOR'
    ],
    BHARUCH: [
      'VAGRA',
      'ZAGHADIA',
      'AMOD',
      'NETRANG',
      'VALIA',
      'ANKLESHWAR',
      'JAMBUSAR',
      'BHARUCH',
      'HANSOT'
    ],
    GIRSOMNATH: [
      'GIRGADHADA',
      'UNA',
      'TALALA',
      'KODINAR',
      'SUTRAPADA',
      'VERAVAL'
    ],
    PORBANDAR: [
      'PORBANDAR',
      'RANAVAV',
      'KUTIYANA'
    ],
    DAHOD: [
      'LIMKHEDA',
      'DAHOD',
      'ZALOD',
      'GARBADA',
      'SANJELI',
      'DHANPUR',
      'SINGVAD',
      'FATEPURA',
      'DEVBARIA'
    ],
    SURAT: [
      'MANGROL',
      'MAHUVA',
      'OLPAD',
      'CHORYASI',
      'PALASANA',
      'SURATCORPO',
      'MANDAVI',
      'KAMREJ',
      'BARDOLI',
      'UMARPADA'
    ],
    JAMNAGAR: [
      'DHROL',
      'JAMNAGAR',
      'LALPUR',
      'JODIYA',
      'KALAVAD',
      'JAMJODHPUR'
    ],
    KHEDA: [
      'THASARA',
      'VASO',
      'MAHEMDAVAD',
      'KATHLAL',
      'KHEDA',
      'KAPADVANJ',
      'NADIAD',
      'GALTESHWAR',
      'MAHUDHA',
      'MATAR'
    ],
    VADODARA: [
      'DABHOI',
      'SAVLI',
      'VADODARACORPORATION',
      'VAGHODIYA',
      'DESAR',
      'VADODARA',
      'KARJAN',
      'PADRA',
      'SHINOR'
    ],
    RAJKOT: [
      'JAMKANDORNA',
      'PADDHARI',
      'GONDAL',
      'LODHIKA',
      'JASDAN',
      'RAJKOTCORPORATION',
      'VINCHHIYA',
      'UPLETA',
      'DHORAJI',
      'JETPUR',
      'KOTDASANGANI',
      'RAJKOT'
    ],
    BANASKANTHA: [
      'VAV',
      'DANTA',
      'VADGAM',
      'BHABHAR',
      'PALANPUR',
      'DEESA',
      'LAKHANI',
      'DEODAR',
      'KANKAREJ',
      'THARAD',
      'AMIRGADH',
      'DANTIWADA',
      'DHANERA',
      'SUIGAM'
    ],
    NARMADA: [
      'GARUDESHWAR',
      'DEDIYAPADA',
      'SAGBARA',
      'TILAKVADA',
      'NANDOD'
    ],
    KACHCHH: [
      'BHACHAU',
      'GANDHIDHAM',
      'MANDVI',
      'MUNDRA',
      'NAKHATRANA',
      'BHUJ',
      'RAPAR',
      'LAKHAPAT',
      'ABDASA',
      'ANJAR'
    ],
    AHMEDABAD: [
      'DASCROI',
      'CITY',
      'VIRAMGAM',
      'AMC',
      'SANAND',
      'BAVLA',
      'DHOLKA',
      'DHANDHUKA',
      'DETROJRAMPURA',
      'DHOLERA',
      'MANDAL'
    ],
    BHAVNAGAR: [
      'SHIHOR',
      'UMRALA',
      'MAHUVA',
      'VALLBHIPUR',
      'TALAJA',
      'GARIYADHAR',
      'JESAR',
      'PALITANA',
      'GHOGHA',
      'BHAVNAGAR'
    ],
    JUNAGADH: [
      'MANGROL',
      'MALIYAHATINA',
      'MENDARDA',
      'KESHOD',
      'JUNAGADH',
      'JUNAGADHCORPORATION',
      'BHESAN',
      'VISAVADAR',
      'MANAVADAR',
      'VANTHALI'
    ],
    VALSAD: [
      'VALSAD',
      'VAPI',
      'UMBERGAON',
      'PARDI',
      'KAPARADA',
      'DHARAMPUR'
    ],
    ANAND: [
      'UMRETH',
      'TARAPUR',
      'SOJITRA',
      'PETLAD',
      'BORSAD',
      'KHAMBHAT',
      'ANKLAV',
      'ANAND'
    ],
    SURENDRANAGAR: [
      'DHRANGADHRA',
      'CHOTILA',
      'THANGADH',
      'PATDIDASADA',
      'SAYLA',
      'CHUDA',
      'WADHVAN',
      'LAKHTAR',
      'LIMBDI',
      'MULI'
    ],
    TAPI: [
      'KUKARMUNDA',
      'SONGADH',
      'UCHCHHAL',
      'VALOD',
      'DOLVAN',
      'VYARA',
      'NIZAR'
    ],
    NAVSARI: [
      'VANSDA',
      'CHIKHLI',
      'JALALPOR',
      'KHERGAM',
      'GANDEVI',
      'NAVSARI'
    ],
    PANCHMAHALS: [
      'KALOL',
      'SHAHERA',
      'JAMBUGHODA',
      'GHOGHAMBA',
      'HALOL',
      'GODHRA',
      'MORVAHADAF'
    ],
    AMRELI: [
      'DHARI',
      'SAVARKUNDLA',
      'KUKAVAV',
      'RAJULA',
      'JAFRABAD',
      'AMRELI',
      'BABARA',
      'LATHI',
      'LILIYA',
      'KHAMBHA',
      'BAGASARA'
    ],
    PATAN: [
      'SAMI',
      'SHANKHESHWAR',
      'SIDDHPUR',
      'HARIJ',
      'CHANASMA',
      'RADHANPUR',
      'PATAN',
      'SARASWATI',
      'SANTALPUR'
    ],
    DEVBHUMIDWARKA: [
      'DWARKA',
      'JAMKHAMBHALIYA',
      'JAMKALYANPUR',
      'BHANVAD'
    ],
    GANDHINAGAR: [
      'KALOL',
      'DEHGAM',
      'MANSA',
      'GANDHINAGAR'
    ],
    ARVALLI: [
      'DHANSURA',
      'BHILODA',
      'MALPUR',
      'MEGHRAJ',
      'BAYAD',
      'MODASA'
    ],
    MORBI: [
      'HALVAD',
      'WANKANER',
      'MALIYA',
      'MORBI',
      'TANKARA'
    ]
  }

const MANAGEMENTS = [
  'CENTRALGOVERNMENTSCHOOL',
  'GOVERNMENTAIDEDSCHOOL',
  'GOVERNMENTSCHOOL',
  'PRIVATESCHOOL',
  'RECOGNIZEDMADARSA',
  'SPECIALGOVERNMENTSCHOOL'
]

const SCHOOL_TYPES = [ 'BOYS', 'COEDUCATIONAL', 'GIRLS' ]
const LOCATION_TYPES = [ null, 'RURAL', 'URBAN' ]

const MEDIUMS =[
  'ENGLISH', 'GUJARATI',
  'HINDI',   'MARATHI',
  'ORIYA',   'SANSKRIT',
  'URDU'
]

const BOARDS = [ null, 'CBSE', 'ICSE', 'INTERNATIONALBOARD', 'STATEBOARD' ]

const STREAMS = [ 'ARTS', 'COMMERCE', 'SCIENCE' ,"VOCATIONAL", "OTHER", ]

const CATEGORY_TYPES = [
  null,
  'HIGHERSECONDARY',
  'PRIMARY',
  'PRIMARYTOHIGHERSECONDARY',
  'PRIMARYTOSECONDARY',
  'PRIMARYUPPERPRIMARY',
  'SECONDARY',
  'SECONDARYHIGHERSECONDARY',
  'UPPERPRIMARY',
  'UPPERPRIMARYTOHIGHERSECONDARY',
  'UPPERPRIMARYTOSECONDARY'
];

const GRADE_FROM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const GRADE_TO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const SORT_OPTIONS = [
  "students",
  "name",
  "district",
  "quality",
  "newest",
];

// ── NEW (v2) — added for the new nested document shape ──
// status.type replaces the old flat `status: "active"` string
const STATUS_TYPES = ['ACTIVE', 'INACTIVE', 'CLOSED', 'UNVERIFIED'];

// profile.visibility — new in v2
const VISIBILITY_TYPES = ['PUBLIC', 'PRIVATE'];

// subscription.plan — new in v2. Adjust/extend once you finalize pricing tiers.
const SUBSCRIPTION_PLANS = ['FREE', 'PREMIUM'];

module.exports = {
  DISTRICTS,
  DISTRICT_TALUKAS,
  MEDIUMS,
  BOARDS,
  STREAMS,
  MANAGEMENTS,
  SCHOOL_TYPES,
  LOCATION_TYPES,
  CATEGORY_TYPES,
  GRADE_FROM,
  GRADE_TO,
  SORT_OPTIONS,
  STATUS_TYPES,
  VISIBILITY_TYPES,
  SUBSCRIPTION_PLANS,
};