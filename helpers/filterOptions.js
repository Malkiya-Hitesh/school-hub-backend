// config/filterOptions.js
// Single source of truth for all filter enum values.
// Used by routes for validation and by frontend for dropdowns.

const DISTRICTS = [
  "AHMEDABAD", "AMRELI", "ANAND", "Arvalli", "BANAS KANTHA",
  "BHARUCH", "BHAVNAGAR", "BOTAD", "CHHOTAUDEPUR", "Dahod",
  "Dangs", "Devbhumi Dwarka", "GANDHINAGAR", "GIR SOMNATH",
  "JAMNAGAR", "JUNAGADH", "KACHCHH", "KHEDA", "MAHESANA",
  "MAHISAGAR", "MORBI", "NARMADA", "NAVSARI", "PANCH MAHALS",
  "PATAN", "PORBANDAR", "RAJKOT", "SABAR KANTHA", "SURAT",
  "SURENDRANAGAR", "TAPI", "VADODARA", "VALSAD",
];

const DISTRICT_TALUKAS = {
  AHMEDABAD:           ["DASCROI","DHOLERA","DHOLKA","VIRAMGAM","SANAND","BAVLA","CITY","AMC","DHANDHUKA","DETROJ-RAMPURA"],
  AMRELI:              ["RAJULA","LATHI","KUKAVAV","AMRELI","DHARI","BABARA","LILIYA","SAVARKUNDLA","JAFRABAD","BAGASARA","KHAMBHA"],
  ANAND:               ["TARAPUR","KHAMBHAT","ANAND","BORSAD","PETLAD","SOJITRA","UMRETH"],
  Arvalli:             ["MALPUR","MEGHRAJ","BAYAD","MODASA","BHILODA","DHANSURA"],
  "BANAS KANTHA":      ["VADGAM","BHABHAR","DANTA","SUIGAM","DEODAR","DEESA","DANTIWADA","AMIRGADH","KANKAREJ","PALANPUR","DHANERA","LAKHANI","THARAD","VAV"],
  BHARUCH:             ["ZAGHADIA","HANSOT","ANKLESHWAR","JAMBUSAR","AMOD","BHARUCH","NETRANG","VALIA","VAGRA"],
  BHAVNAGAR:           ["JESAR","PALITANA","GARIYADHAR","SHIHOR","GHOGHA","TALAJA","BHAVNAGAR","VALLBHIPUR","UMRALA","MAHUVA"],
  BOTAD:               ["BOTAD","RANPUR","GADHADA","BARVALA"],
  CHHOTAUDEPUR:        ["KAWANT","NASWADI","JETPUR-PAVI","SANKHEDA","BODELI","CHHOTA-UDEPUR"],
  Dahod:               ["FATEPURA","GARBADA","DHANPUR","SANJELI","DEV.BARIA","LIMKHEDA","SINGVAD","ZALOD","DAHOD"],
  Dangs:               ["WAGHAI","AHWA","SUBIR"],
  "Devbhumi Dwarka":   ["BHANVAD","JAMKHAMBHALIYA","JAMKALYANPUR","DWARKA"],
  GANDHINAGAR:         ["DEHGAM","KALOL","MANSA","GANDHINAGAR"],
  "GIR SOMNATH":       ["KODINAR","TALALA","SUTRAPADA","VERAVAL","GIRGADHADA","UNA"],
  JAMNAGAR:            ["KALAVAD","JAMNAGAR","LALPUR","DHROL","JODIYA","JAMJODHPUR"],
  JUNAGADH:            ["MANAVADAR","MANGROL","MALIYA HATINA","VANTHALI","JUNAGADH","JUNAGADH CORPORATION","KESHOD","BHESAN","VISAVADAR","MENDARDA"],
  KACHCHH:             ["GANDHIDHAM","ANJAR","BHUJ","RAPAR","ABDASA","MUNDRA","NAKHATRANA","BHACHAU","LAKHAPAT","MANDVI"],
  KHEDA:               ["KAPADVANJ","KATHLAL","THASARA","KHEDA","MATAR","NADIAD"],
  MAHESANA:            ["SATLASANA","VADNAGAR","MEHSANA","UNJHA","BECHARAJI","KADI","KHERALU","JOTANA","VISNAGAR","VIJAPUR"],
  MAHISAGAR:           ["VIRPUR","KHANPUR","SANTRAMPUR","LUNAWADA","KADANA","BALASINOR"],
  MORBI:               ["MORBI","WANKANER","TANKARA","MALIYA","HALVAD"],
  NARMADA:             ["NANDOD","DEDIYAPADA","TILAKVADA","SAGBARA","GARUDESHWAR"],
  NAVSARI:             ["CHIKHLI","KHERGAM","VANSDA","GANDEVI","JALALPOR"],
  "PANCH MAHALS":      ["JAMBUGHODA","KALOL","SHAHERA","MORVA HADAF","HALOL","GHOGHAMBA","GODHRA"],
  PATAN:               ["SARASWATI","CHANASMA","SIDDHPUR","SHANKHESHWAR","PATAN","SAMI","HARIJ","RADHANPUR"],
  PORBANDAR:           ["KUTIYANA","PORBANDAR","RANAVAV"],
  RAJKOT:              ["DHORAJI","RAJKOT","VINCHHIYA","LODHIKA","JASDAN","JETPUR","UPLETA","GONDAL","KOTDA SANGANI","RAJKOT CORPORATION","PADDHARI","JAMKANDORNA"],
  "SABAR KANTHA":      ["KHEDBRAHMA","PRANTIJ","TALOD","POSHINA","IDAR","VIJAYNAGAR","VADALI","HIMMATNAGAR"],
  SURAT:               ["CHORYASI","OLPAD","MANGROL","MAHUVA","UMARPADA","MANDAVI","SURAT CORPO.","BARDOLI","PALASANA","KAMREJ"],
  SURENDRANAGAR:       ["LIMBDI","MULI","THANGADH","CHUDA","WADHVAN","LAKHTAR","CHOTILA","SAYLA","DHRANGADHRA","PATDI - DASADA"],
  TAPI:                ["VYARA","SONGADH","NIZAR","KUKARMUNDA"],
  VADODARA:            ["DESAR","SHINOR","VADODARA CORPORATION","DABHOI","SAVLI","VAGHODIYA","KARJAN","PADRA","VADODARA"],
  VALSAD:              ["VALSAD","UMBERGAON","DHARAMPUR","VAPI","PARDI","KAPARADA"],
};

const MEDIUMS = ["Gujarati","English","Hindi","Marathi","Oriya","Sanskrit","Urdu"];

const BOARDS = ["State Board","CBSE","ICSE","International Board","NA"];

const STREAMS = ["Science","Commerce","Arts","Vocational","NA"];

const MANAGEMENTS = [
  "Government School",
  "Government Aided School",
  "Private School",
  "Central Government School",
  "Special Government School",
  "Recognized Madarsa",
  "Government Aided Madarsa",
  "Unrecognized Madarsa",
  "Unrecognized School",
];

const SCHOOL_TYPES = ["Boys","Girls","Co-educational"];

const LOCATION_TYPES = ["Rural","Urban"];

const CATEGORY_TYPES = [
  "1-Primary",
  "2-Primary with Upper Primary",
  "3-Pr. with Up.Pr. Sec. and H.Sec.",
  "4-Upper Primary only",
  "5-Up. Pr. Secondary and Higher Sec",
  "6-Pr. Up Pr. and Secondary Only",
  "7-Upper Pr. and Secondary",
  "8-Secondary Only",
  "10-Secondary with Higher Secondary",
  "11-Higher Secondary only/Jr. College",
];

const GRADE_FROM = [0,1,2,3,4,5,6,7,8,9,10,11];
const GRADE_TO   = [1,2,3,4,5,6,7,8,9,10,11,12];

const SORT_OPTIONS = ["students","name","district","quality","newest"];

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
};
