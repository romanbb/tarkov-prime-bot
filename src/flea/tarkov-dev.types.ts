export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};

export type Ammo = {
    __typename?: "Ammo";
    /** @deprecated Use accuracyModifier instead. */
    accuracy?: Maybe<Scalars["Int"]>;
    accuracyModifier?: Maybe<Scalars["Float"]>;
    ammoType: Scalars["String"];
    armorDamage: Scalars["Int"];
    caliber?: Maybe<Scalars["String"]>;
    damage: Scalars["Int"];
    fragmentationChance: Scalars["Float"];
    heavyBleedModifier: Scalars["Float"];
    initialSpeed?: Maybe<Scalars["Float"]>;
    item: Item;
    lightBleedModifier: Scalars["Float"];
    penetrationChance: Scalars["Float"];
    penetrationPower: Scalars["Int"];
    projectileCount?: Maybe<Scalars["Int"]>;
    /** @deprecated Use recoilModifier instead. */
    recoil?: Maybe<Scalars["Int"]>;
    recoilModifier?: Maybe<Scalars["Float"]>;
    ricochetChance: Scalars["Float"];
    stackMaxSize: Scalars["Int"];
    staminaBurnPerDamage?: Maybe<Scalars["Float"]>;
    tracer: Scalars["Boolean"];
    tracerColor?: Maybe<Scalars["String"]>;
    weight: Scalars["Float"];
};

export type ArmorMaterial = {
    __typename?: "ArmorMaterial";
    destructibility?: Maybe<Scalars["Float"]>;
    explosionDestructibility?: Maybe<Scalars["Float"]>;
    id?: Maybe<Scalars["String"]>;
    maxRepairDegradation?: Maybe<Scalars["Float"]>;
    maxRepairKitDegradation?: Maybe<Scalars["Float"]>;
    minRepairDegradation?: Maybe<Scalars["Float"]>;
    minRepairKitDegradation?: Maybe<Scalars["Float"]>;
    name?: Maybe<Scalars["String"]>;
};

export type AttributeThreshold = {
    __typename?: "AttributeThreshold";
    name: Scalars["String"];
    requirement: NumberCompare;
};

export type Barter = {
    __typename?: "Barter";
    id: Scalars["ID"];
    level: Scalars["Int"];
    requiredItems: Array<Maybe<ContainedItem>>;
    /** @deprecated Use level instead. */
    requirements: Array<Maybe<PriceRequirement>>;
    rewardItems: Array<Maybe<ContainedItem>>;
    /** @deprecated Use trader and level instead. */
    source: Scalars["String"];
    /** @deprecated Use trader instead. */
    sourceName: ItemSourceName;
    taskUnlock?: Maybe<Task>;
    trader: Trader;
};

export type BossEscort = {
    __typename?: "BossEscort";
    amount?: Maybe<Array<Maybe<BossEscortAmount>>>;
    boss: MobInfo;
    /** @deprecated Use boss.name instead. */
    name: Scalars["String"];
    /** @deprecated Use boss.normalizedName instead. */
    normalizedName: Scalars["String"];
};

export type BossEscortAmount = {
    __typename?: "BossEscortAmount";
    chance: Scalars["Float"];
    count: Scalars["Int"];
};

export type BossSpawn = {
    __typename?: "BossSpawn";
    boss: MobInfo;
    escorts: Array<Maybe<BossEscort>>;
    /** @deprecated Use boss.name instead. */
    name: Scalars["String"];
    /** @deprecated Use boss.normalizedName instead. */
    normalizedName: Scalars["String"];
    spawnChance: Scalars["Float"];
    spawnLocations: Array<Maybe<BossSpawnLocation>>;
    spawnTime?: Maybe<Scalars["Int"]>;
    spawnTimeRandom?: Maybe<Scalars["Boolean"]>;
    spawnTrigger?: Maybe<Scalars["String"]>;
    switch?: Maybe<MapSwitch>;
};

/**
 * The chances of spawning in a given location are
 * very rough estimates and may be incaccurate
 */
export type BossSpawnLocation = {
    __typename?: "BossSpawnLocation";
    chance: Scalars["Float"];
    name: Scalars["String"];
    spawnKey: Scalars["String"];
};

export type ContainedItem = {
    __typename?: "ContainedItem";
    attributes?: Maybe<Array<Maybe<ItemAttribute>>>;
    count: Scalars["Float"];
    item: Item;
    quantity: Scalars["Float"];
};

export type Craft = {
    __typename?: "Craft";
    duration: Scalars["Int"];
    id: Scalars["ID"];
    level: Scalars["Int"];
    requiredItems: Array<Maybe<ContainedItem>>;
    requiredQuestItems: Array<Maybe<QuestItem>>;
    /** @deprecated Use stationLevel instead. */
    requirements: Array<Maybe<PriceRequirement>>;
    rewardItems: Array<Maybe<ContainedItem>>;
    /** @deprecated Use stationLevel instead. */
    source: Scalars["String"];
    /** @deprecated Use stationLevel instead. */
    sourceName: Scalars["String"];
    station: HideoutStation;
    taskUnlock?: Maybe<Task>;
};

export type FleaMarket = Vendor & {
    __typename?: "FleaMarket";
    enabled: Scalars["Boolean"];
    minPlayerLevel: Scalars["Int"];
    name: Scalars["String"];
    normalizedName: Scalars["String"];
    reputationLevels: Array<Maybe<FleaMarketReputationLevel>>;
    sellOfferFeeRate: Scalars["Float"];
    sellRequirementFeeRate: Scalars["Float"];
};

export type FleaMarketReputationLevel = {
    __typename?: "FleaMarketReputationLevel";
    maxRep: Scalars["Float"];
    minRep: Scalars["Float"];
    offers: Scalars["Int"];
};

export type GameProperty = {
    __typename?: "GameProperty";
    arrayValue?: Maybe<Array<Maybe<Scalars["String"]>>>;
    key: Scalars["String"];
    numericValue?: Maybe<Scalars["Float"]>;
    objectValue?: Maybe<Scalars["String"]>;
    stringValue?: Maybe<Scalars["String"]>;
};

export enum HandbookCategoryName {
    Ammo = "Ammo",
    AmmoPacks = "AmmoPacks",
    AssaultCarbines = "AssaultCarbines",
    AssaultRifles = "AssaultRifles",
    AssaultScopes = "AssaultScopes",
    AuxiliaryParts = "AuxiliaryParts",
    Backpacks = "Backpacks",
    Barrels = "Barrels",
    BarterItems = "BarterItems",
    Bipods = "Bipods",
    BodyArmor = "BodyArmor",
    BoltActionRifles = "BoltActionRifles",
    BuildingMaterials = "BuildingMaterials",
    ChargingHandles = "ChargingHandles",
    Collimators = "Collimators",
    CompactCollimators = "CompactCollimators",
    Drinks = "Drinks",
    ElectronicKeys = "ElectronicKeys",
    Electronics = "Electronics",
    EnergyElements = "EnergyElements",
    Eyewear = "Eyewear",
    Facecovers = "Facecovers",
    FlammableMaterials = "FlammableMaterials",
    FlashhidersBrakes = "FlashhidersBrakes",
    Flashlights = "Flashlights",
    Food = "Food",
    Foregrips = "Foregrips",
    FunctionalMods = "FunctionalMods",
    GasBlocks = "GasBlocks",
    Gear = "Gear",
    GearComponents = "GearComponents",
    GearMods = "GearMods",
    GrenadeLaunchers = "GrenadeLaunchers",
    Handguards = "Handguards",
    Headgear = "Headgear",
    Headsets = "Headsets",
    HouseholdMaterials = "HouseholdMaterials",
    InfoItems = "InfoItems",
    Injectors = "Injectors",
    InjuryTreatment = "InjuryTreatment",
    IronSights = "IronSights",
    Keys = "Keys",
    LaserTargetPointers = "LaserTargetPointers",
    Launchers = "Launchers",
    LightLaserDevices = "LightLaserDevices",
    MachineGuns = "MachineGuns",
    Magazines = "Magazines",
    Maps = "Maps",
    MarksmanRifles = "MarksmanRifles",
    MechanicalKeys = "MechanicalKeys",
    MedicalSupplies = "MedicalSupplies",
    Medication = "Medication",
    Medkits = "Medkits",
    MeleeWeapons = "MeleeWeapons",
    Money = "Money",
    Mounts = "Mounts",
    MuzzleAdapters = "MuzzleAdapters",
    MuzzleDevices = "MuzzleDevices",
    Optics = "Optics",
    Others = "Others",
    Pills = "Pills",
    PistolGrips = "PistolGrips",
    Pistols = "Pistols",
    Provisions = "Provisions",
    QuestItems = "QuestItems",
    ReceiversSlides = "ReceiversSlides",
    Rounds = "Rounds",
    SmGs = "SMGs",
    SecureContainers = "SecureContainers",
    Shotguns = "Shotguns",
    Sights = "Sights",
    SpecialEquipment = "SpecialEquipment",
    SpecialPurposeSights = "SpecialPurposeSights",
    SpecialWeapons = "SpecialWeapons",
    StocksChassis = "StocksChassis",
    StorageContainers = "StorageContainers",
    Suppressors = "Suppressors",
    TacticalComboDevices = "TacticalComboDevices",
    TacticalRigs = "TacticalRigs",
    Throwables = "Throwables",
    Tools = "Tools",
    Valuables = "Valuables",
    VitalParts = "VitalParts",
    WeaponPartsMods = "WeaponPartsMods",
    Weapons = "Weapons",
}

export type HealthEffect = {
    __typename?: "HealthEffect";
    bodyParts: Array<Maybe<Scalars["String"]>>;
    effects: Array<Maybe<Scalars["String"]>>;
    time?: Maybe<NumberCompare>;
};

export type HealthPart = {
    __typename?: "HealthPart";
    bodyPart: Scalars["String"];
    id: Scalars["ID"];
    max: Scalars["Int"];
};

/** HideoutModule has been replaced with HideoutStation. */
export type HideoutModule = {
    __typename?: "HideoutModule";
    /** @deprecated Use HideoutStation type instead. */
    id?: Maybe<Scalars["Int"]>;
    itemRequirements: Array<Maybe<ContainedItem>>;
    level?: Maybe<Scalars["Int"]>;
    moduleRequirements: Array<Maybe<HideoutModule>>;
    /** @deprecated Use HideoutStation type instead. */
    name?: Maybe<Scalars["String"]>;
};

export type HideoutStation = {
    __typename?: "HideoutStation";
    /** crafts is only available via the hideoutStations query. */
    crafts: Array<Maybe<Craft>>;
    id: Scalars["ID"];
    levels: Array<Maybe<HideoutStationLevel>>;
    name: Scalars["String"];
    normalizedName: Scalars["String"];
    tarkovDataId?: Maybe<Scalars["Int"]>;
};

export type HideoutStationBonus = {
    __typename?: "HideoutStationBonus";
    name: Scalars["String"];
    passive?: Maybe<Scalars["Boolean"]>;
    production?: Maybe<Scalars["Boolean"]>;
    skillName?: Maybe<Scalars["String"]>;
    slotItems?: Maybe<Array<Maybe<Item>>>;
    type: Scalars["String"];
    value?: Maybe<Scalars["Float"]>;
};

export type HideoutStationLevel = {
    __typename?: "HideoutStationLevel";
    bonuses?: Maybe<Array<Maybe<HideoutStationBonus>>>;
    constructionTime: Scalars["Int"];
    /** crafts is only available via the hideoutStations query. */
    crafts: Array<Maybe<Craft>>;
    description: Scalars["String"];
    id: Scalars["ID"];
    itemRequirements: Array<Maybe<RequirementItem>>;
    level: Scalars["Int"];
    skillRequirements: Array<Maybe<RequirementSkill>>;
    stationLevelRequirements: Array<Maybe<RequirementHideoutStationLevel>>;
    tarkovDataId?: Maybe<Scalars["Int"]>;
    traderRequirements: Array<Maybe<RequirementTrader>>;
};

export type Item = {
    __typename?: "Item";
    accuracyModifier?: Maybe<Scalars["Float"]>;
    avg24hPrice?: Maybe<Scalars["Int"]>;
    backgroundColor: Scalars["String"];
    bartersFor: Array<Maybe<Barter>>;
    bartersUsing: Array<Maybe<Barter>>;
    baseImageLink?: Maybe<Scalars["String"]>;
    basePrice: Scalars["Int"];
    blocksHeadphones?: Maybe<Scalars["Boolean"]>;
    /** @deprecated Use category instead. */
    bsgCategory?: Maybe<ItemCategory>;
    bsgCategoryId?: Maybe<Scalars["String"]>;
    buyFor?: Maybe<Array<ItemPrice>>;
    categories: Array<Maybe<ItemCategory>>;
    category?: Maybe<ItemCategory>;
    /** @deprecated No longer meaningful with inclusion of Item category. */
    categoryTop?: Maybe<ItemCategory>;
    changeLast48h?: Maybe<Scalars["Float"]>;
    changeLast48hPercent?: Maybe<Scalars["Float"]>;
    conflictingItems?: Maybe<Array<Maybe<Item>>>;
    conflictingSlotIds?: Maybe<Array<Maybe<Scalars["String"]>>>;
    containsItems?: Maybe<Array<Maybe<ContainedItem>>>;
    craftsFor: Array<Maybe<Craft>>;
    craftsUsing: Array<Maybe<Craft>>;
    description?: Maybe<Scalars["String"]>;
    ergonomicsModifier?: Maybe<Scalars["Float"]>;
    fleaMarketFee?: Maybe<Scalars["Int"]>;
    gridImageLink?: Maybe<Scalars["String"]>;
    /** @deprecated Fallback handled automatically by gridImageLink. */
    gridImageLinkFallback: Scalars["String"];
    handbookCategories: Array<Maybe<ItemCategory>>;
    hasGrid?: Maybe<Scalars["Boolean"]>;
    height: Scalars["Int"];
    high24hPrice?: Maybe<Scalars["Int"]>;
    /** historicalPrices is only available via the item and items queries. */
    historicalPrices?: Maybe<Array<Maybe<HistoricalPricePoint>>>;
    iconLink?: Maybe<Scalars["String"]>;
    /** @deprecated Fallback handled automatically by iconLink. */
    iconLinkFallback: Scalars["String"];
    id: Scalars["ID"];
    image8xLink?: Maybe<Scalars["String"]>;
    image512pxLink?: Maybe<Scalars["String"]>;
    /** @deprecated Use inspectImageLink instead. */
    imageLink?: Maybe<Scalars["String"]>;
    /** @deprecated Fallback handled automatically by inspectImageLink. */
    imageLinkFallback: Scalars["String"];
    inspectImageLink?: Maybe<Scalars["String"]>;
    lastLowPrice?: Maybe<Scalars["Int"]>;
    lastOfferCount?: Maybe<Scalars["Int"]>;
    link?: Maybe<Scalars["String"]>;
    loudness?: Maybe<Scalars["Int"]>;
    low24hPrice?: Maybe<Scalars["Int"]>;
    name?: Maybe<Scalars["String"]>;
    normalizedName?: Maybe<Scalars["String"]>;
    properties?: Maybe<ItemProperties>;
    receivedFromTasks: Array<Maybe<Task>>;
    recoilModifier?: Maybe<Scalars["Float"]>;
    sellFor?: Maybe<Array<ItemPrice>>;
    shortName?: Maybe<Scalars["String"]>;
    /** @deprecated Use sellFor instead. */
    traderPrices: Array<Maybe<TraderPrice>>;
    /** @deprecated Use the lang argument on queries instead. */
    translation?: Maybe<ItemTranslation>;
    types: Array<Maybe<ItemType>>;
    updated?: Maybe<Scalars["String"]>;
    usedInTasks: Array<Maybe<Task>>;
    velocity?: Maybe<Scalars["Float"]>;
    weight?: Maybe<Scalars["Float"]>;
    width: Scalars["Int"];
    wikiLink?: Maybe<Scalars["String"]>;
};

export type ItemFleaMarketFeeArgs = {
    count?: InputMaybe<Scalars["Int"]>;
    hideoutManagementLevel?: InputMaybe<Scalars["Int"]>;
    intelCenterLevel?: InputMaybe<Scalars["Int"]>;
    price?: InputMaybe<Scalars["Int"]>;
    requireAll?: InputMaybe<Scalars["Boolean"]>;
};

export type ItemTranslationArgs = {
    languageCode?: InputMaybe<LanguageCode>;
};

export type ItemArmorSlot = {
    nameId?: Maybe<Scalars["String"]>;
    zones?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

export type ItemArmorSlotLocked = ItemArmorSlot & {
    __typename?: "ItemArmorSlotLocked";
    armorType?: Maybe<Scalars["String"]>;
    baseValue?: Maybe<Scalars["Int"]>;
    bluntThroughput?: Maybe<Scalars["Float"]>;
    class?: Maybe<Scalars["Int"]>;
    durability?: Maybe<Scalars["Int"]>;
    ergoPenalty?: Maybe<Scalars["Float"]>;
    material?: Maybe<ArmorMaterial>;
    name?: Maybe<Scalars["String"]>;
    nameId?: Maybe<Scalars["String"]>;
    repairCost?: Maybe<Scalars["Int"]>;
    speedPenalty?: Maybe<Scalars["Float"]>;
    turnPenalty?: Maybe<Scalars["Float"]>;
    zones?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

export type ItemArmorSlotOpen = ItemArmorSlot & {
    __typename?: "ItemArmorSlotOpen";
    allowedPlates?: Maybe<Array<Maybe<Item>>>;
    name?: Maybe<Scalars["String"]>;
    nameId?: Maybe<Scalars["String"]>;
    zones?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

export type ItemAttribute = {
    __typename?: "ItemAttribute";
    name: Scalars["String"];
    type: Scalars["String"];
    value?: Maybe<Scalars["String"]>;
};

export type ItemCategory = {
    __typename?: "ItemCategory";
    children?: Maybe<Array<Maybe<ItemCategory>>>;
    id: Scalars["ID"];
    name: Scalars["String"];
    normalizedName: Scalars["String"];
    parent?: Maybe<ItemCategory>;
};

export enum ItemCategoryName {
    Ammo = "Ammo",
    AmmoContainer = "AmmoContainer",
    ArmBand = "ArmBand",
    Armor = "Armor",
    ArmorPlate = "ArmorPlate",
    ArmoredEquipment = "ArmoredEquipment",
    AssaultCarbine = "AssaultCarbine",
    AssaultRifle = "AssaultRifle",
    AssaultScope = "AssaultScope",
    AuxiliaryMod = "AuxiliaryMod",
    Backpack = "Backpack",
    Barrel = "Barrel",
    BarterItem = "BarterItem",
    Battery = "Battery",
    Bipod = "Bipod",
    BuildingMaterial = "BuildingMaterial",
    ChargingHandle = "ChargingHandle",
    ChestRig = "ChestRig",
    CombMuzzleDevice = "CombMuzzleDevice",
    CombTactDevice = "CombTactDevice",
    CommonContainer = "CommonContainer",
    CompactReflexSight = "CompactReflexSight",
    Compass = "Compass",
    CompoundItem = "CompoundItem",
    CultistAmulet = "CultistAmulet",
    CylinderMagazine = "CylinderMagazine",
    Drink = "Drink",
    Drug = "Drug",
    Electronics = "Electronics",
    Equipment = "Equipment",
    EssentialMod = "EssentialMod",
    FaceCover = "FaceCover",
    Flashhider = "Flashhider",
    Flashlight = "Flashlight",
    Food = "Food",
    FoodAndDrink = "FoodAndDrink",
    Foregrip = "Foregrip",
    Fuel = "Fuel",
    FunctionalMod = "FunctionalMod",
    GasBlock = "GasBlock",
    GearMod = "GearMod",
    GrenadeLauncher = "GrenadeLauncher",
    Handguard = "Handguard",
    Handgun = "Handgun",
    Headphones = "Headphones",
    Headwear = "Headwear",
    HouseholdGoods = "HouseholdGoods",
    Info = "Info",
    Ironsight = "Ironsight",
    Item = "Item",
    Jewelry = "Jewelry",
    Key = "Key",
    Keycard = "Keycard",
    Knife = "Knife",
    LockingContainer = "LockingContainer",
    Lubricant = "Lubricant",
    Machinegun = "Machinegun",
    Magazine = "Magazine",
    Map = "Map",
    MarksmanRifle = "MarksmanRifle",
    MechanicalKey = "MechanicalKey",
    MedicalItem = "MedicalItem",
    MedicalSupplies = "MedicalSupplies",
    Medikit = "Medikit",
    Meds = "Meds",
    Money = "Money",
    Mount = "Mount",
    MuzzleDevice = "MuzzleDevice",
    NightVision = "NightVision",
    Other = "Other",
    PistolGrip = "PistolGrip",
    PortContainer = "PortContainer",
    PortableRangeFinder = "PortableRangeFinder",
    RadioTransmitter = "RadioTransmitter",
    RandomLootContainer = "RandomLootContainer",
    Receiver = "Receiver",
    ReflexSight = "ReflexSight",
    RepairKits = "RepairKits",
    Revolver = "Revolver",
    Smg = "SMG",
    Scope = "Scope",
    SearchableItem = "SearchableItem",
    Shotgun = "Shotgun",
    Sights = "Sights",
    Silencer = "Silencer",
    SniperRifle = "SniperRifle",
    SpecialItem = "SpecialItem",
    SpecialScope = "SpecialScope",
    SpringDrivenCylinder = "SpringDrivenCylinder",
    StackableItem = "StackableItem",
    Stimulant = "Stimulant",
    Stock = "Stock",
    ThermalVision = "ThermalVision",
    ThrowableWeapon = "ThrowableWeapon",
    Tool = "Tool",
    Ubgl = "UBGL",
    VisObservDevice = "VisObservDevice",
    Weapon = "Weapon",
    WeaponMod = "WeaponMod",
}

export type ItemFilters = {
    __typename?: "ItemFilters";
    allowedCategories: Array<Maybe<ItemCategory>>;
    allowedItems: Array<Maybe<Item>>;
    excludedCategories: Array<Maybe<ItemCategory>>;
    excludedItems: Array<Maybe<Item>>;
};

export type ItemPrice = {
    __typename?: "ItemPrice";
    currency?: Maybe<Scalars["String"]>;
    currencyItem?: Maybe<Item>;
    price?: Maybe<Scalars["Int"]>;
    priceRUB?: Maybe<Scalars["Int"]>;
    /** @deprecated Use vendor instead. */
    requirements: Array<Maybe<PriceRequirement>>;
    /** @deprecated Use vendor instead. */
    source?: Maybe<ItemSourceName>;
    vendor: Vendor;
};

export type ItemProperties =
    | ItemPropertiesAmmo
    | ItemPropertiesArmor
    | ItemPropertiesArmorAttachment
    | ItemPropertiesBackpack
    | ItemPropertiesBarrel
    | ItemPropertiesChestRig
    | ItemPropertiesContainer
    | ItemPropertiesFoodDrink
    | ItemPropertiesGlasses
    | ItemPropertiesGrenade
    | ItemPropertiesHeadphone
    | ItemPropertiesHelmet
    | ItemPropertiesKey
    | ItemPropertiesMagazine
    | ItemPropertiesMedKit
    | ItemPropertiesMedicalItem
    | ItemPropertiesMelee
    | ItemPropertiesNightVision
    | ItemPropertiesPainkiller
    | ItemPropertiesPreset
    | ItemPropertiesResource
    | ItemPropertiesScope
    | ItemPropertiesStim
    | ItemPropertiesSurgicalKit
    | ItemPropertiesWeapon
    | ItemPropertiesWeaponMod;

export type ItemPropertiesAmmo = {
    __typename?: "ItemPropertiesAmmo";
    /** @deprecated Use accuracyModifier instead. */
    accuracy?: Maybe<Scalars["Int"]>;
    accuracyModifier?: Maybe<Scalars["Float"]>;
    ammoType?: Maybe<Scalars["String"]>;
    armorDamage?: Maybe<Scalars["Int"]>;
    ballisticCoeficient?: Maybe<Scalars["Float"]>;
    bulletDiameterMilimeters?: Maybe<Scalars["Float"]>;
    bulletMassGrams?: Maybe<Scalars["Float"]>;
    caliber?: Maybe<Scalars["String"]>;
    damage?: Maybe<Scalars["Int"]>;
    durabilityBurnFactor?: Maybe<Scalars["Float"]>;
    fragmentationChance?: Maybe<Scalars["Float"]>;
    heatFactor?: Maybe<Scalars["Float"]>;
    heavyBleedModifier?: Maybe<Scalars["Float"]>;
    initialSpeed?: Maybe<Scalars["Float"]>;
    lightBleedModifier?: Maybe<Scalars["Float"]>;
    penetrationChance?: Maybe<Scalars["Float"]>;
    penetrationPower?: Maybe<Scalars["Int"]>;
    projectileCount?: Maybe<Scalars["Int"]>;
    /** @deprecated Use recoilModifier instead. */
    recoil?: Maybe<Scalars["Float"]>;
    recoilModifier?: Maybe<Scalars["Float"]>;
    ricochetChance?: Maybe<Scalars["Float"]>;
    stackMaxSize?: Maybe<Scalars["Int"]>;
    staminaBurnPerDamage?: Maybe<Scalars["Float"]>;
    tracer?: Maybe<Scalars["Boolean"]>;
    tracerColor?: Maybe<Scalars["String"]>;
};

export type ItemPropertiesArmor = {
    __typename?: "ItemPropertiesArmor";
    armorSlots?: Maybe<Array<Maybe<ItemArmorSlot>>>;
    armorType?: Maybe<Scalars["String"]>;
    bluntThroughput?: Maybe<Scalars["Float"]>;
    class?: Maybe<Scalars["Int"]>;
    durability?: Maybe<Scalars["Int"]>;
    ergoPenalty?: Maybe<Scalars["Int"]>;
    material?: Maybe<ArmorMaterial>;
    repairCost?: Maybe<Scalars["Int"]>;
    speedPenalty?: Maybe<Scalars["Float"]>;
    turnPenalty?: Maybe<Scalars["Float"]>;
    zones?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

export type ItemPropertiesArmorAttachment = {
    __typename?: "ItemPropertiesArmorAttachment";
    blindnessProtection?: Maybe<Scalars["Float"]>;
    bluntThroughput?: Maybe<Scalars["Float"]>;
    class?: Maybe<Scalars["Int"]>;
    durability?: Maybe<Scalars["Int"]>;
    ergoPenalty?: Maybe<Scalars["Int"]>;
    headZones?: Maybe<Array<Maybe<Scalars["String"]>>>;
    material?: Maybe<ArmorMaterial>;
    repairCost?: Maybe<Scalars["Int"]>;
    slots?: Maybe<Array<Maybe<ItemSlot>>>;
    speedPenalty?: Maybe<Scalars["Float"]>;
    turnPenalty?: Maybe<Scalars["Float"]>;
};

export type ItemPropertiesBackpack = {
    __typename?: "ItemPropertiesBackpack";
    capacity?: Maybe<Scalars["Int"]>;
    ergoPenalty?: Maybe<Scalars["Int"]>;
    grids?: Maybe<Array<Maybe<ItemStorageGrid>>>;
    /** @deprecated Use grids instead. */
    pouches?: Maybe<Array<Maybe<ItemStorageGrid>>>;
    speedPenalty?: Maybe<Scalars["Float"]>;
    turnPenalty?: Maybe<Scalars["Float"]>;
};

export type ItemPropertiesBarrel = {
    __typename?: "ItemPropertiesBarrel";
    /** @deprecated Use centerOfImpact, deviationCurve, and deviationMax instead. */
    accuracyModifier?: Maybe<Scalars["Float"]>;
    centerOfImpact?: Maybe<Scalars["Float"]>;
    deviationCurve?: Maybe<Scalars["Float"]>;
    deviationMax?: Maybe<Scalars["Float"]>;
    ergonomics?: Maybe<Scalars["Float"]>;
    /** @deprecated Use recoilModifier instead. */
    recoil?: Maybe<Scalars["Float"]>;
    recoilModifier?: Maybe<Scalars["Float"]>;
    slots?: Maybe<Array<Maybe<ItemSlot>>>;
};

export type ItemPropertiesChestRig = {
    __typename?: "ItemPropertiesChestRig";
    armorSlots?: Maybe<Array<Maybe<ItemArmorSlot>>>;
    armorType?: Maybe<Scalars["String"]>;
    bluntThroughput?: Maybe<Scalars["Float"]>;
    capacity?: Maybe<Scalars["Int"]>;
    class?: Maybe<Scalars["Int"]>;
    durability?: Maybe<Scalars["Int"]>;
    ergoPenalty?: Maybe<Scalars["Int"]>;
    grids?: Maybe<Array<Maybe<ItemStorageGrid>>>;
    material?: Maybe<ArmorMaterial>;
    /** @deprecated Use grids instead. */
    pouches?: Maybe<Array<Maybe<ItemStorageGrid>>>;
    repairCost?: Maybe<Scalars["Int"]>;
    speedPenalty?: Maybe<Scalars["Float"]>;
    turnPenalty?: Maybe<Scalars["Float"]>;
    zones?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

export type ItemPropertiesContainer = {
    __typename?: "ItemPropertiesContainer";
    capacity?: Maybe<Scalars["Int"]>;
    grids?: Maybe<Array<Maybe<ItemStorageGrid>>>;
};

export type ItemPropertiesFoodDrink = {
    __typename?: "ItemPropertiesFoodDrink";
    energy?: Maybe<Scalars["Int"]>;
    hydration?: Maybe<Scalars["Int"]>;
    stimEffects: Array<Maybe<StimEffect>>;
    units?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesGlasses = {
    __typename?: "ItemPropertiesGlasses";
    blindnessProtection?: Maybe<Scalars["Float"]>;
    bluntThroughput?: Maybe<Scalars["Float"]>;
    class?: Maybe<Scalars["Int"]>;
    durability?: Maybe<Scalars["Int"]>;
    material?: Maybe<ArmorMaterial>;
    repairCost?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesGrenade = {
    __typename?: "ItemPropertiesGrenade";
    contusionRadius?: Maybe<Scalars["Int"]>;
    fragments?: Maybe<Scalars["Int"]>;
    fuse?: Maybe<Scalars["Float"]>;
    maxExplosionDistance?: Maybe<Scalars["Int"]>;
    minExplosionDistance?: Maybe<Scalars["Int"]>;
    type?: Maybe<Scalars["String"]>;
};

export type ItemPropertiesHeadphone = {
    __typename?: "ItemPropertiesHeadphone";
    ambientVolume?: Maybe<Scalars["Int"]>;
    compressorAttack?: Maybe<Scalars["Int"]>;
    compressorGain?: Maybe<Scalars["Int"]>;
    compressorRelease?: Maybe<Scalars["Int"]>;
    compressorThreshold?: Maybe<Scalars["Int"]>;
    compressorVolume?: Maybe<Scalars["Int"]>;
    cutoffFrequency?: Maybe<Scalars["Int"]>;
    distanceModifier?: Maybe<Scalars["Float"]>;
    distortion?: Maybe<Scalars["Float"]>;
    dryVolume?: Maybe<Scalars["Int"]>;
    highFrequencyGain?: Maybe<Scalars["Float"]>;
    resonance?: Maybe<Scalars["Float"]>;
};

export type ItemPropertiesHelmet = {
    __typename?: "ItemPropertiesHelmet";
    armorSlots?: Maybe<Array<Maybe<ItemArmorSlot>>>;
    armorType?: Maybe<Scalars["String"]>;
    blindnessProtection?: Maybe<Scalars["Float"]>;
    blocksHeadset?: Maybe<Scalars["Boolean"]>;
    bluntThroughput?: Maybe<Scalars["Float"]>;
    class?: Maybe<Scalars["Int"]>;
    deafening?: Maybe<Scalars["String"]>;
    durability?: Maybe<Scalars["Int"]>;
    ergoPenalty?: Maybe<Scalars["Int"]>;
    headZones?: Maybe<Array<Maybe<Scalars["String"]>>>;
    material?: Maybe<ArmorMaterial>;
    repairCost?: Maybe<Scalars["Int"]>;
    ricochetX?: Maybe<Scalars["Float"]>;
    ricochetY?: Maybe<Scalars["Float"]>;
    ricochetZ?: Maybe<Scalars["Float"]>;
    slots?: Maybe<Array<Maybe<ItemSlot>>>;
    speedPenalty?: Maybe<Scalars["Float"]>;
    turnPenalty?: Maybe<Scalars["Float"]>;
};

export type ItemPropertiesKey = {
    __typename?: "ItemPropertiesKey";
    uses?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesMagazine = {
    __typename?: "ItemPropertiesMagazine";
    allowedAmmo?: Maybe<Array<Maybe<Item>>>;
    ammoCheckModifier?: Maybe<Scalars["Float"]>;
    capacity?: Maybe<Scalars["Int"]>;
    ergonomics?: Maybe<Scalars["Float"]>;
    loadModifier?: Maybe<Scalars["Float"]>;
    malfunctionChance?: Maybe<Scalars["Float"]>;
    /** @deprecated Use recoilModifier instead. */
    recoil?: Maybe<Scalars["Float"]>;
    recoilModifier?: Maybe<Scalars["Float"]>;
    slots?: Maybe<Array<Maybe<ItemSlot>>>;
};

export type ItemPropertiesMedKit = {
    __typename?: "ItemPropertiesMedKit";
    cures?: Maybe<Array<Maybe<Scalars["String"]>>>;
    hitpoints?: Maybe<Scalars["Int"]>;
    hpCostHeavyBleeding?: Maybe<Scalars["Int"]>;
    hpCostLightBleeding?: Maybe<Scalars["Int"]>;
    maxHealPerUse?: Maybe<Scalars["Int"]>;
    useTime?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesMedicalItem = {
    __typename?: "ItemPropertiesMedicalItem";
    cures?: Maybe<Array<Maybe<Scalars["String"]>>>;
    useTime?: Maybe<Scalars["Int"]>;
    uses?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesMelee = {
    __typename?: "ItemPropertiesMelee";
    hitRadius?: Maybe<Scalars["Float"]>;
    slashDamage?: Maybe<Scalars["Int"]>;
    stabDamage?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesNightVision = {
    __typename?: "ItemPropertiesNightVision";
    diffuseIntensity?: Maybe<Scalars["Float"]>;
    intensity?: Maybe<Scalars["Float"]>;
    noiseIntensity?: Maybe<Scalars["Float"]>;
    noiseScale?: Maybe<Scalars["Float"]>;
};

export type ItemPropertiesPainkiller = {
    __typename?: "ItemPropertiesPainkiller";
    cures?: Maybe<Array<Maybe<Scalars["String"]>>>;
    energyImpact?: Maybe<Scalars["Int"]>;
    hydrationImpact?: Maybe<Scalars["Int"]>;
    painkillerDuration?: Maybe<Scalars["Int"]>;
    useTime?: Maybe<Scalars["Int"]>;
    uses?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesPreset = {
    __typename?: "ItemPropertiesPreset";
    baseItem: Item;
    default?: Maybe<Scalars["Boolean"]>;
    ergonomics?: Maybe<Scalars["Float"]>;
    moa?: Maybe<Scalars["Float"]>;
    recoilHorizontal?: Maybe<Scalars["Int"]>;
    recoilVertical?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesResource = {
    __typename?: "ItemPropertiesResource";
    units?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesScope = {
    __typename?: "ItemPropertiesScope";
    ergonomics?: Maybe<Scalars["Float"]>;
    /** @deprecated Use recoilModifier instead. */
    recoil?: Maybe<Scalars["Float"]>;
    recoilModifier?: Maybe<Scalars["Float"]>;
    sightModes?: Maybe<Array<Maybe<Scalars["Int"]>>>;
    sightingRange?: Maybe<Scalars["Int"]>;
    slots?: Maybe<Array<Maybe<ItemSlot>>>;
    zoomLevels?: Maybe<Array<Maybe<Array<Maybe<Scalars["Float"]>>>>>;
};

export type ItemPropertiesStim = {
    __typename?: "ItemPropertiesStim";
    cures?: Maybe<Array<Maybe<Scalars["String"]>>>;
    stimEffects: Array<Maybe<StimEffect>>;
    useTime?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesSurgicalKit = {
    __typename?: "ItemPropertiesSurgicalKit";
    cures?: Maybe<Array<Maybe<Scalars["String"]>>>;
    maxLimbHealth?: Maybe<Scalars["Float"]>;
    minLimbHealth?: Maybe<Scalars["Float"]>;
    useTime?: Maybe<Scalars["Int"]>;
    uses?: Maybe<Scalars["Int"]>;
};

export type ItemPropertiesWeapon = {
    __typename?: "ItemPropertiesWeapon";
    allowedAmmo?: Maybe<Array<Maybe<Item>>>;
    caliber?: Maybe<Scalars["String"]>;
    cameraRecoil?: Maybe<Scalars["Float"]>;
    cameraSnap?: Maybe<Scalars["Float"]>;
    centerOfImpact?: Maybe<Scalars["Float"]>;
    convergence?: Maybe<Scalars["Float"]>;
    defaultAmmo?: Maybe<Item>;
    defaultErgonomics?: Maybe<Scalars["Float"]>;
    defaultHeight?: Maybe<Scalars["Int"]>;
    defaultPreset?: Maybe<Item>;
    defaultRecoilHorizontal?: Maybe<Scalars["Int"]>;
    defaultRecoilVertical?: Maybe<Scalars["Int"]>;
    defaultWeight?: Maybe<Scalars["Float"]>;
    defaultWidth?: Maybe<Scalars["Int"]>;
    deviationCurve?: Maybe<Scalars["Float"]>;
    deviationMax?: Maybe<Scalars["Float"]>;
    effectiveDistance?: Maybe<Scalars["Int"]>;
    ergonomics?: Maybe<Scalars["Float"]>;
    fireModes?: Maybe<Array<Maybe<Scalars["String"]>>>;
    fireRate?: Maybe<Scalars["Int"]>;
    maxDurability?: Maybe<Scalars["Int"]>;
    presets?: Maybe<Array<Maybe<Item>>>;
    recoilAngle?: Maybe<Scalars["Int"]>;
    recoilDispersion?: Maybe<Scalars["Int"]>;
    recoilHorizontal?: Maybe<Scalars["Int"]>;
    recoilVertical?: Maybe<Scalars["Int"]>;
    repairCost?: Maybe<Scalars["Int"]>;
    sightingRange?: Maybe<Scalars["Int"]>;
    slots?: Maybe<Array<Maybe<ItemSlot>>>;
};

export type ItemPropertiesWeaponMod = {
    __typename?: "ItemPropertiesWeaponMod";
    accuracyModifier?: Maybe<Scalars["Float"]>;
    ergonomics?: Maybe<Scalars["Float"]>;
    /** @deprecated Use recoilModifier instead. */
    recoil?: Maybe<Scalars["Float"]>;
    recoilModifier?: Maybe<Scalars["Float"]>;
    slots?: Maybe<Array<Maybe<ItemSlot>>>;
};

export type ItemSlot = {
    __typename?: "ItemSlot";
    filters?: Maybe<ItemFilters>;
    id: Scalars["ID"];
    name: Scalars["String"];
    nameId: Scalars["String"];
    required?: Maybe<Scalars["Boolean"]>;
};

export enum ItemSourceName {
    Fence = "fence",
    FleaMarket = "fleaMarket",
    Jaeger = "jaeger",
    Mechanic = "mechanic",
    Peacekeeper = "peacekeeper",
    Prapor = "prapor",
    Ragman = "ragman",
    Skier = "skier",
    Therapist = "therapist",
}

export type ItemStorageGrid = {
    __typename?: "ItemStorageGrid";
    filters: ItemFilters;
    height: Scalars["Int"];
    width: Scalars["Int"];
};

/**
 * The below types are all deprecated and may not return current data.
 * ItemTranslation has been replaced with the lang argument on all queries
 */
export type ItemTranslation = {
    __typename?: "ItemTranslation";
    /** @deprecated Use the lang argument on queries instead. */
    description?: Maybe<Scalars["String"]>;
    /** @deprecated Use the lang argument on queries instead. */
    name?: Maybe<Scalars["String"]>;
    /** @deprecated Use the lang argument on queries instead. */
    shortName?: Maybe<Scalars["String"]>;
};

export enum ItemType {
    Ammo = "ammo",
    AmmoBox = "ammoBox",
    Any = "any",
    Armor = "armor",
    ArmorPlate = "armorPlate",
    Backpack = "backpack",
    Barter = "barter",
    Container = "container",
    Glasses = "glasses",
    Grenade = "grenade",
    Gun = "gun",
    Headphones = "headphones",
    Helmet = "helmet",
    Injectors = "injectors",
    Keys = "keys",
    MarkedOnly = "markedOnly",
    Meds = "meds",
    Mods = "mods",
    NoFlea = "noFlea",
    PistolGrip = "pistolGrip",
    Preset = "preset",
    Provisions = "provisions",
    Rig = "rig",
    Suppressor = "suppressor",
    Wearable = "wearable",
}

export enum LanguageCode {
    Cs = "cs",
    De = "de",
    En = "en",
    Es = "es",
    Fr = "fr",
    Hu = "hu",
    It = "it",
    Ja = "ja",
    Ko = "ko",
    Pl = "pl",
    Pt = "pt",
    Ru = "ru",
    Sk = "sk",
    Tr = "tr",
    Zh = "zh",
}

export type Lock = {
    __typename?: "Lock";
    bottom?: Maybe<Scalars["Float"]>;
    key?: Maybe<Item>;
    lockType?: Maybe<Scalars["String"]>;
    needsPower?: Maybe<Scalars["Boolean"]>;
    outline?: Maybe<Array<Maybe<MapPosition>>>;
    position?: Maybe<MapPosition>;
    top?: Maybe<Scalars["Float"]>;
};

export type LootContainer = {
    __typename?: "LootContainer";
    id: Scalars["ID"];
    name: Scalars["String"];
    normalizedName: Scalars["String"];
};

export type LootContainerPosition = {
    __typename?: "LootContainerPosition";
    lootContainer?: Maybe<LootContainer>;
    position?: Maybe<MapPosition>;
};

export type Map = {
    __typename?: "Map";
    accessKeys: Array<Maybe<Item>>;
    accessKeysMinPlayerLevel?: Maybe<Scalars["Int"]>;
    bosses: Array<Maybe<BossSpawn>>;
    description?: Maybe<Scalars["String"]>;
    enemies?: Maybe<Array<Maybe<Scalars["String"]>>>;
    extracts?: Maybe<Array<Maybe<MapExtract>>>;
    hazards?: Maybe<Array<Maybe<MapHazard>>>;
    id: Scalars["ID"];
    locks?: Maybe<Array<Maybe<Lock>>>;
    lootContainers?: Maybe<Array<Maybe<LootContainerPosition>>>;
    name: Scalars["String"];
    nameId?: Maybe<Scalars["String"]>;
    normalizedName: Scalars["String"];
    players?: Maybe<Scalars["String"]>;
    raidDuration?: Maybe<Scalars["Int"]>;
    spawns?: Maybe<Array<Maybe<MapSpawn>>>;
    stationaryWeapons?: Maybe<Array<Maybe<StationaryWeaponPosition>>>;
    switches?: Maybe<Array<Maybe<MapSwitch>>>;
    tarkovDataId?: Maybe<Scalars["ID"]>;
    wiki?: Maybe<Scalars["String"]>;
};

export type MapExtract = {
    __typename?: "MapExtract";
    bottom?: Maybe<Scalars["Float"]>;
    faction?: Maybe<Scalars["String"]>;
    id: Scalars["ID"];
    name?: Maybe<Scalars["String"]>;
    outline?: Maybe<Array<Maybe<MapPosition>>>;
    position?: Maybe<MapPosition>;
    switches?: Maybe<Array<Maybe<MapSwitch>>>;
    top?: Maybe<Scalars["Float"]>;
};

export type MapHazard = {
    __typename?: "MapHazard";
    bottom?: Maybe<Scalars["Float"]>;
    hazardType?: Maybe<Scalars["String"]>;
    name?: Maybe<Scalars["String"]>;
    outline?: Maybe<Array<Maybe<MapPosition>>>;
    position?: Maybe<MapPosition>;
    top?: Maybe<Scalars["Float"]>;
};

export type MapPosition = {
    __typename?: "MapPosition";
    x: Scalars["Float"];
    y: Scalars["Float"];
    z: Scalars["Float"];
};

export type MapSpawn = {
    __typename?: "MapSpawn";
    categories?: Maybe<Array<Maybe<Scalars["String"]>>>;
    position: MapPosition;
    sides?: Maybe<Array<Maybe<Scalars["String"]>>>;
    zoneName?: Maybe<Scalars["String"]>;
};

export type MapSwitch = {
    __typename?: "MapSwitch";
    activatedBy?: Maybe<MapSwitch>;
    activates?: Maybe<Array<Maybe<MapSwitchOperation>>>;
    id: Scalars["ID"];
    name?: Maybe<Scalars["String"]>;
    position?: Maybe<MapPosition>;
    switchType?: Maybe<Scalars["String"]>;
};

export type MapSwitchOperation = {
    __typename?: "MapSwitchOperation";
    operation?: Maybe<Scalars["String"]>;
    target?: Maybe<MapSwitchTarget>;
};

export type MapSwitchTarget = MapExtract | MapSwitch;

export type MapWithPosition = {
    __typename?: "MapWithPosition";
    map?: Maybe<Map>;
    positions?: Maybe<Array<Maybe<MapPosition>>>;
};

export type MobInfo = {
    __typename?: "MobInfo";
    /** equipment and items are estimates and may be inaccurate. */
    equipment: Array<Maybe<ContainedItem>>;
    health?: Maybe<Array<Maybe<HealthPart>>>;
    id: Scalars["ID"];
    imagePortraitLink?: Maybe<Scalars["String"]>;
    imagePosterLink?: Maybe<Scalars["String"]>;
    items: Array<Maybe<Item>>;
    name: Scalars["String"];
    normalizedName: Scalars["String"];
};

export type NumberCompare = {
    __typename?: "NumberCompare";
    compareMethod: Scalars["String"];
    value: Scalars["Float"];
};

export type OfferUnlock = {
    __typename?: "OfferUnlock";
    id: Scalars["ID"];
    item: Item;
    level: Scalars["Int"];
    trader: Trader;
};

export type PlayerLevel = {
    __typename?: "PlayerLevel";
    exp: Scalars["Int"];
    level: Scalars["Int"];
};

export type PriceRequirement = {
    __typename?: "PriceRequirement";
    stringValue?: Maybe<Scalars["String"]>;
    type: RequirementType;
    value?: Maybe<Scalars["Int"]>;
};

export type Query = {
    __typename?: "Query";
    ammo?: Maybe<Array<Maybe<Ammo>>>;
    armorMaterials: Array<Maybe<ArmorMaterial>>;
    barters?: Maybe<Array<Maybe<Barter>>>;
    bosses?: Maybe<Array<Maybe<MobInfo>>>;
    crafts?: Maybe<Array<Maybe<Craft>>>;
    fleaMarket: FleaMarket;
    handbookCategories: Array<Maybe<ItemCategory>>;
    /** @deprecated Use hideoutStations instead. */
    hideoutModules?: Maybe<Array<Maybe<HideoutModule>>>;
    hideoutStations: Array<Maybe<HideoutStation>>;
    historicalItemPrices: Array<Maybe<HistoricalPricePoint>>;
    item?: Maybe<Item>;
    /** @deprecated Use item instead. */
    itemByNormalizedName?: Maybe<Item>;
    itemCategories: Array<Maybe<ItemCategory>>;
    items: Array<Maybe<Item>>;
    /** @deprecated Use items instead. */
    itemsByBsgCategoryId: Array<Maybe<Item>>;
    /** @deprecated Use items instead. */
    itemsByIDs?: Maybe<Array<Maybe<Item>>>;
    /** @deprecated Use items instead. */
    itemsByName: Array<Maybe<Item>>;
    /** @deprecated Use items instead. */
    itemsByType: Array<Maybe<Item>>;
    lootContainers?: Maybe<Array<Maybe<LootContainer>>>;
    maps: Array<Maybe<Map>>;
    playerLevels: Array<Maybe<PlayerLevel>>;
    questItems?: Maybe<Array<Maybe<QuestItem>>>;
    /** @deprecated Use tasks instead. */
    quests?: Maybe<Array<Maybe<Quest>>>;
    stationaryWeapons?: Maybe<Array<Maybe<StationaryWeapon>>>;
    status: ServerStatus;
    task?: Maybe<Task>;
    tasks: Array<Maybe<Task>>;
    /** @deprecated Use traders instead. */
    traderResetTimes?: Maybe<Array<Maybe<TraderResetTime>>>;
    traders: Array<Maybe<Trader>>;
};

export type QueryAmmoArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryArmorMaterialsArgs = {
    lang?: InputMaybe<LanguageCode>;
};

export type QueryBartersArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryBossesArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    name?: InputMaybe<Array<Scalars["String"]>>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryCraftsArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryFleaMarketArgs = {
    lang?: InputMaybe<LanguageCode>;
};

export type QueryHandbookCategoriesArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryHideoutStationsArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryHistoricalItemPricesArgs = {
    days?: InputMaybe<Scalars["Int"]>;
    id: Scalars["ID"];
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryItemArgs = {
    id?: InputMaybe<Scalars["ID"]>;
    lang?: InputMaybe<LanguageCode>;
    normalizedName?: InputMaybe<Scalars["String"]>;
};

export type QueryItemByNormalizedNameArgs = {
    normalizedName: Scalars["String"];
};

export type QueryItemCategoriesArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryItemsArgs = {
    bsgCategory?: InputMaybe<Scalars["String"]>;
    bsgCategoryId?: InputMaybe<Scalars["String"]>;
    bsgCategoryIds?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
    categoryNames?: InputMaybe<Array<InputMaybe<ItemCategoryName>>>;
    handbookCategoryNames?: InputMaybe<Array<InputMaybe<HandbookCategoryName>>>;
    ids?: InputMaybe<Array<InputMaybe<Scalars["ID"]>>>;
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    name?: InputMaybe<Scalars["String"]>;
    names?: InputMaybe<Array<InputMaybe<Scalars["String"]>>>;
    offset?: InputMaybe<Scalars["Int"]>;
    type?: InputMaybe<ItemType>;
    types?: InputMaybe<Array<InputMaybe<ItemType>>>;
};

export type QueryItemsByBsgCategoryIdArgs = {
    bsgCategoryId: Scalars["String"];
};

export type QueryItemsByIDsArgs = {
    ids: Array<InputMaybe<Scalars["ID"]>>;
};

export type QueryItemsByNameArgs = {
    name: Scalars["String"];
};

export type QueryItemsByTypeArgs = {
    type: ItemType;
};

export type QueryLootContainersArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryMapsArgs = {
    enemies?: InputMaybe<Array<Scalars["String"]>>;
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    name?: InputMaybe<Array<Scalars["String"]>>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryQuestItemsArgs = {
    lang?: InputMaybe<LanguageCode>;
};

export type QueryStationaryWeaponsArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryTaskArgs = {
    id: Scalars["ID"];
    lang?: InputMaybe<LanguageCode>;
};

export type QueryTasksArgs = {
    faction?: InputMaybe<Scalars["String"]>;
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryTradersArgs = {
    lang?: InputMaybe<LanguageCode>;
    limit?: InputMaybe<Scalars["Int"]>;
    offset?: InputMaybe<Scalars["Int"]>;
};

/** Quest has been replaced with Task. */
export type Quest = {
    __typename?: "Quest";
    /** @deprecated Use Task type instead. */
    exp: Scalars["Int"];
    /** @deprecated Use Task type instead. */
    giver: Trader;
    /** @deprecated Use Task type instead. */
    id: Scalars["String"];
    /** @deprecated Use Task type instead. */
    objectives: Array<Maybe<QuestObjective>>;
    /** @deprecated Use Task type instead. */
    reputation?: Maybe<Array<QuestRewardReputation>>;
    /** @deprecated Use Task type instead. */
    requirements?: Maybe<QuestRequirement>;
    /** @deprecated Use Task type instead. */
    title: Scalars["String"];
    /** @deprecated Use Task type instead. */
    turnin: Trader;
    /** @deprecated Use Task type instead. */
    unlocks: Array<Maybe<Scalars["String"]>>;
    /** @deprecated Use Task type instead. */
    wikiLink: Scalars["String"];
};

export type QuestItem = {
    __typename?: "QuestItem";
    baseImageLink?: Maybe<Scalars["String"]>;
    description?: Maybe<Scalars["String"]>;
    gridImageLink?: Maybe<Scalars["String"]>;
    height?: Maybe<Scalars["Int"]>;
    iconLink?: Maybe<Scalars["String"]>;
    id?: Maybe<Scalars["ID"]>;
    image8xLink?: Maybe<Scalars["String"]>;
    image512pxLink?: Maybe<Scalars["String"]>;
    inspectImageLink?: Maybe<Scalars["String"]>;
    name: Scalars["String"];
    normalizedName?: Maybe<Scalars["String"]>;
    shortName?: Maybe<Scalars["String"]>;
    width?: Maybe<Scalars["Int"]>;
};

/** QuestObjective has been replaced with TaskObjective. */
export type QuestObjective = {
    __typename?: "QuestObjective";
    /** @deprecated Use Task type instead. */
    id?: Maybe<Scalars["String"]>;
    /** @deprecated Use Task type instead. */
    location?: Maybe<Scalars["String"]>;
    /** @deprecated Use Task type instead. */
    number?: Maybe<Scalars["Int"]>;
    /** @deprecated Use Task type instead. */
    target?: Maybe<Array<Scalars["String"]>>;
    /** @deprecated Use Task type instead. */
    targetItem?: Maybe<Item>;
    /** @deprecated Use Task type instead. */
    type: Scalars["String"];
};

/** QuestRequirement has been replaced with TaskRequirement. */
export type QuestRequirement = {
    __typename?: "QuestRequirement";
    /** @deprecated Use Task type instead. */
    level?: Maybe<Scalars["Int"]>;
    /** @deprecated Use Task type instead. */
    prerequisiteQuests: Array<Maybe<Array<Maybe<Quest>>>>;
    /** @deprecated Use Task type instead. */
    quests: Array<Maybe<Array<Maybe<Scalars["Int"]>>>>;
};

export type QuestRewardReputation = {
    __typename?: "QuestRewardReputation";
    /** @deprecated Use Task type instead. */
    amount: Scalars["Float"];
    /** @deprecated Use Task type instead. */
    trader: Trader;
};

export type RequirementHideoutStationLevel = {
    __typename?: "RequirementHideoutStationLevel";
    id?: Maybe<Scalars["ID"]>;
    level: Scalars["Int"];
    station: HideoutStation;
};

export type RequirementItem = {
    __typename?: "RequirementItem";
    attributes?: Maybe<Array<Maybe<ItemAttribute>>>;
    count: Scalars["Int"];
    id?: Maybe<Scalars["ID"]>;
    item: Item;
    quantity: Scalars["Int"];
};

export type RequirementSkill = {
    __typename?: "RequirementSkill";
    id?: Maybe<Scalars["ID"]>;
    level: Scalars["Int"];
    name: Scalars["String"];
};

export type RequirementTask = {
    __typename?: "RequirementTask";
    id?: Maybe<Scalars["ID"]>;
    task: Task;
};

export type RequirementTrader = {
    __typename?: "RequirementTrader";
    compareMethod?: Maybe<Scalars["String"]>;
    id?: Maybe<Scalars["ID"]>;
    /** @deprecated Use value instead. */
    level?: Maybe<Scalars["Int"]>;
    requirementType?: Maybe<Scalars["String"]>;
    trader: Trader;
    value?: Maybe<Scalars["Int"]>;
};

export enum RequirementType {
    LoyaltyLevel = "loyaltyLevel",
    PlayerLevel = "playerLevel",
    QuestCompleted = "questCompleted",
    StationLevel = "stationLevel",
}

export type ServerStatus = {
    __typename?: "ServerStatus";
    currentStatuses?: Maybe<Array<Maybe<Status>>>;
    generalStatus?: Maybe<Status>;
    messages?: Maybe<Array<Maybe<StatusMessage>>>;
};

export type SkillLevel = {
    __typename?: "SkillLevel";
    level: Scalars["Float"];
    name: Scalars["String"];
};

export type StationaryWeapon = {
    __typename?: "StationaryWeapon";
    id?: Maybe<Scalars["ID"]>;
    name?: Maybe<Scalars["String"]>;
    shortName?: Maybe<Scalars["String"]>;
};

export type StationaryWeaponPosition = {
    __typename?: "StationaryWeaponPosition";
    position?: Maybe<MapPosition>;
    stationaryWeapon?: Maybe<StationaryWeapon>;
};

export type Status = {
    __typename?: "Status";
    message?: Maybe<Scalars["String"]>;
    name: Scalars["String"];
    status: Scalars["Int"];
    statusCode: Scalars["String"];
};

export enum StatusCode {
    Down = "Down",
    Ok = "OK",
    Unstable = "Unstable",
    Updating = "Updating",
}

export type StatusMessage = {
    __typename?: "StatusMessage";
    content: Scalars["String"];
    solveTime?: Maybe<Scalars["String"]>;
    statusCode: Scalars["String"];
    time: Scalars["String"];
    type: Scalars["Int"];
};

export type StimEffect = {
    __typename?: "StimEffect";
    chance: Scalars["Float"];
    delay: Scalars["Int"];
    duration: Scalars["Int"];
    percent: Scalars["Boolean"];
    skillName?: Maybe<Scalars["String"]>;
    type: Scalars["String"];
    value: Scalars["Float"];
};

export type Task = {
    __typename?: "Task";
    descriptionMessageId?: Maybe<Scalars["String"]>;
    experience: Scalars["Int"];
    factionName?: Maybe<Scalars["String"]>;
    failConditions: Array<Maybe<TaskObjective>>;
    failMessageId?: Maybe<Scalars["String"]>;
    failureOutcome?: Maybe<TaskRewards>;
    finishRewards?: Maybe<TaskRewards>;
    id?: Maybe<Scalars["ID"]>;
    kappaRequired?: Maybe<Scalars["Boolean"]>;
    lightkeeperRequired?: Maybe<Scalars["Boolean"]>;
    map?: Maybe<Map>;
    minPlayerLevel?: Maybe<Scalars["Int"]>;
    name: Scalars["String"];
    /** @deprecated Use requiredKeys on objectives instead. */
    neededKeys?: Maybe<Array<Maybe<TaskKey>>>;
    normalizedName: Scalars["String"];
    objectives: Array<Maybe<TaskObjective>>;
    restartable?: Maybe<Scalars["Boolean"]>;
    startMessageId?: Maybe<Scalars["String"]>;
    startRewards?: Maybe<TaskRewards>;
    successMessageId?: Maybe<Scalars["String"]>;
    tarkovDataId?: Maybe<Scalars["Int"]>;
    taskImageLink?: Maybe<Scalars["String"]>;
    taskRequirements: Array<Maybe<TaskStatusRequirement>>;
    trader: Trader;
    /** @deprecated Use traderRequirements instead. */
    traderLevelRequirements: Array<Maybe<RequirementTrader>>;
    traderRequirements: Array<Maybe<RequirementTrader>>;
    wikiLink?: Maybe<Scalars["String"]>;
};

export type TaskKey = {
    __typename?: "TaskKey";
    keys: Array<Maybe<Item>>;
    map?: Maybe<Map>;
};

export type TaskObjective = {
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    type: Scalars["String"];
};

export type TaskObjectiveBasic = TaskObjective & {
    __typename?: "TaskObjectiveBasic";
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    requiredKeys?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    type: Scalars["String"];
    zones?: Maybe<Array<Maybe<TaskZone>>>;
};

export type TaskObjectiveBuildItem = TaskObjective & {
    __typename?: "TaskObjectiveBuildItem";
    attributes: Array<Maybe<AttributeThreshold>>;
    containsAll: Array<Maybe<Item>>;
    containsCategory: Array<Maybe<ItemCategory>>;
    /** @deprecated Use containsCategory instead. */
    containsOne: Array<Maybe<Item>>;
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    item: Item;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    type: Scalars["String"];
};

export type TaskObjectiveExperience = TaskObjective & {
    __typename?: "TaskObjectiveExperience";
    count: Scalars["Int"];
    description: Scalars["String"];
    healthEffect: HealthEffect;
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    type: Scalars["String"];
};

export type TaskObjectiveExtract = TaskObjective & {
    __typename?: "TaskObjectiveExtract";
    count: Scalars["Int"];
    description: Scalars["String"];
    exitName?: Maybe<Scalars["String"]>;
    exitStatus: Array<Maybe<Scalars["String"]>>;
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    requiredKeys?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    type: Scalars["String"];
    zoneNames: Array<Maybe<Scalars["String"]>>;
};

export type TaskObjectiveItem = TaskObjective & {
    __typename?: "TaskObjectiveItem";
    count: Scalars["Int"];
    description: Scalars["String"];
    dogTagLevel?: Maybe<Scalars["Int"]>;
    foundInRaid: Scalars["Boolean"];
    id?: Maybe<Scalars["ID"]>;
    item: Item;
    maps: Array<Maybe<Map>>;
    maxDurability?: Maybe<Scalars["Int"]>;
    minDurability?: Maybe<Scalars["Int"]>;
    optional: Scalars["Boolean"];
    requiredKeys?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    type: Scalars["String"];
    zones?: Maybe<Array<Maybe<TaskZone>>>;
};

export type TaskObjectiveMark = TaskObjective & {
    __typename?: "TaskObjectiveMark";
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    markerItem: Item;
    optional: Scalars["Boolean"];
    requiredKeys?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    type: Scalars["String"];
    zones?: Maybe<Array<Maybe<TaskZone>>>;
};

export type TaskObjectivePlayerLevel = TaskObjective & {
    __typename?: "TaskObjectivePlayerLevel";
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    playerLevel: Scalars["Int"];
    type: Scalars["String"];
};

export type TaskObjectiveQuestItem = TaskObjective & {
    __typename?: "TaskObjectiveQuestItem";
    count: Scalars["Int"];
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    possibleLocations?: Maybe<Array<Maybe<MapWithPosition>>>;
    questItem: QuestItem;
    requiredKeys?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    type: Scalars["String"];
    zones?: Maybe<Array<Maybe<TaskZone>>>;
};

export type TaskObjectiveShoot = TaskObjective & {
    __typename?: "TaskObjectiveShoot";
    bodyParts: Array<Maybe<Scalars["String"]>>;
    count: Scalars["Int"];
    description: Scalars["String"];
    distance?: Maybe<NumberCompare>;
    enemyHealthEffect?: Maybe<HealthEffect>;
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    notWearing?: Maybe<Array<Maybe<Item>>>;
    optional: Scalars["Boolean"];
    playerHealthEffect?: Maybe<HealthEffect>;
    requiredKeys?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    shotType: Scalars["String"];
    /** @deprecated Use targetNames instead. */
    target: Scalars["String"];
    targetNames: Array<Maybe<Scalars["String"]>>;
    timeFromHour?: Maybe<Scalars["Int"]>;
    timeUntilHour?: Maybe<Scalars["Int"]>;
    type: Scalars["String"];
    usingWeapon?: Maybe<Array<Maybe<Item>>>;
    usingWeaponMods?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    wearing?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    zoneNames: Array<Maybe<Scalars["String"]>>;
    zones?: Maybe<Array<Maybe<TaskZone>>>;
};

export type TaskObjectiveSkill = TaskObjective & {
    __typename?: "TaskObjectiveSkill";
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    skillLevel: SkillLevel;
    type: Scalars["String"];
};

export type TaskObjectiveTaskStatus = TaskObjective & {
    __typename?: "TaskObjectiveTaskStatus";
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    status: Array<Maybe<Scalars["String"]>>;
    task: Task;
    type: Scalars["String"];
};

export type TaskObjectiveTraderLevel = TaskObjective & {
    __typename?: "TaskObjectiveTraderLevel";
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    level: Scalars["Int"];
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    trader: Trader;
    type: Scalars["String"];
};

export type TaskObjectiveTraderStanding = TaskObjective & {
    __typename?: "TaskObjectiveTraderStanding";
    compareMethod: Scalars["String"];
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    trader: Trader;
    type: Scalars["String"];
    value: Scalars["Int"];
};

export type TaskObjectiveUseItem = TaskObjective & {
    __typename?: "TaskObjectiveUseItem";
    compareMethod: Scalars["String"];
    count: Scalars["Int"];
    description: Scalars["String"];
    id?: Maybe<Scalars["ID"]>;
    maps: Array<Maybe<Map>>;
    optional: Scalars["Boolean"];
    requiredKeys?: Maybe<Array<Maybe<Array<Maybe<Item>>>>>;
    type: Scalars["String"];
    useAny: Array<Maybe<Item>>;
    zoneNames: Array<Maybe<Scalars["String"]>>;
    zones?: Maybe<Array<Maybe<TaskZone>>>;
};

export type TaskRewards = {
    __typename?: "TaskRewards";
    craftUnlock: Array<Maybe<Craft>>;
    items: Array<Maybe<ContainedItem>>;
    offerUnlock: Array<Maybe<OfferUnlock>>;
    skillLevelReward: Array<Maybe<SkillLevel>>;
    traderStanding: Array<Maybe<TraderStanding>>;
    traderUnlock: Array<Maybe<Trader>>;
};

export type TaskStatusRequirement = {
    __typename?: "TaskStatusRequirement";
    status: Array<Maybe<Scalars["String"]>>;
    task: Task;
};

export type TaskZone = {
    __typename?: "TaskZone";
    bottom?: Maybe<Scalars["Float"]>;
    id: Scalars["ID"];
    map?: Maybe<Map>;
    outline?: Maybe<Array<Maybe<MapPosition>>>;
    position?: Maybe<MapPosition>;
    top?: Maybe<Scalars["Float"]>;
};

export type Trader = {
    __typename?: "Trader";
    /** barters and cashOffers are only available via the traders query. */
    barters: Array<Maybe<Barter>>;
    cashOffers: Array<Maybe<TraderCashOffer>>;
    currency: Item;
    description?: Maybe<Scalars["String"]>;
    discount: Scalars["Float"];
    id: Scalars["ID"];
    image4xLink?: Maybe<Scalars["String"]>;
    imageLink?: Maybe<Scalars["String"]>;
    levels: Array<TraderLevel>;
    name: Scalars["String"];
    normalizedName: Scalars["String"];
    reputationLevels: Array<Maybe<TraderReputationLevel>>;
    resetTime?: Maybe<Scalars["String"]>;
    tarkovDataId?: Maybe<Scalars["Int"]>;
};

export type TraderCashOffer = {
    __typename?: "TraderCashOffer";
    currency?: Maybe<Scalars["String"]>;
    currencyItem?: Maybe<Item>;
    item: Item;
    minTraderLevel?: Maybe<Scalars["Int"]>;
    price?: Maybe<Scalars["Int"]>;
    priceRUB?: Maybe<Scalars["Int"]>;
    taskUnlock?: Maybe<Task>;
};

export type TraderLevel = {
    __typename?: "TraderLevel";
    /** barters and cashOffers are only available via the traders query. */
    barters: Array<Maybe<Barter>>;
    cashOffers: Array<Maybe<TraderCashOffer>>;
    id: Scalars["ID"];
    image4xLink?: Maybe<Scalars["String"]>;
    imageLink?: Maybe<Scalars["String"]>;
    insuranceRate?: Maybe<Scalars["Float"]>;
    level: Scalars["Int"];
    payRate: Scalars["Float"];
    repairCostMultiplier?: Maybe<Scalars["Float"]>;
    requiredCommerce: Scalars["Int"];
    requiredPlayerLevel: Scalars["Int"];
    requiredReputation: Scalars["Float"];
};

export enum TraderName {
    Fence = "fence",
    Jaeger = "jaeger",
    Mechanic = "mechanic",
    Peacekeeper = "peacekeeper",
    Prapor = "prapor",
    Ragman = "ragman",
    Skier = "skier",
    Therapist = "therapist",
}

export type TraderOffer = Vendor & {
    __typename?: "TraderOffer";
    minTraderLevel?: Maybe<Scalars["Int"]>;
    name: Scalars["String"];
    normalizedName: Scalars["String"];
    taskUnlock?: Maybe<Task>;
    trader: Trader;
};

/** TraderPrice is deprecated and replaced with ItemPrice. */
export type TraderPrice = {
    __typename?: "TraderPrice";
    /** @deprecated Use item.buyFor instead. */
    currency: Scalars["String"];
    /** @deprecated Use item.buyFor instead. */
    price: Scalars["Int"];
    /** @deprecated Use item.buyFor instead. */
    priceRUB: Scalars["Int"];
    /** @deprecated Use item.buyFor instead. */
    trader: Trader;
};

export type TraderReputationLevel = TraderReputationLevelFence;

export type TraderReputationLevelFence = {
    __typename?: "TraderReputationLevelFence";
    availableScavExtracts?: Maybe<Scalars["Int"]>;
    btrCoveringFireDiscount?: Maybe<Scalars["Int"]>;
    btrDeliveryDiscount?: Maybe<Scalars["Int"]>;
    btrDeliveryGridSize?: Maybe<MapPosition>;
    btrEnabled?: Maybe<Scalars["Boolean"]>;
    btrTaxiDiscount?: Maybe<Scalars["Int"]>;
    extractPriceModifier?: Maybe<Scalars["Float"]>;
    hostileBosses?: Maybe<Scalars["Boolean"]>;
    hostileScavs?: Maybe<Scalars["Boolean"]>;
    minimumReputation: Scalars["Int"];
    priceModifier?: Maybe<Scalars["Float"]>;
    scavAttackSupport?: Maybe<Scalars["Boolean"]>;
    scavCaseTimeModifier?: Maybe<Scalars["Float"]>;
    scavCooldownModifier?: Maybe<Scalars["Float"]>;
    scavEquipmentSpawnChanceModifier?: Maybe<Scalars["Float"]>;
    scavFollowChance?: Maybe<Scalars["Float"]>;
};

/** TraderResetTime is deprecated and replaced with Trader. */
export type TraderResetTime = {
    __typename?: "TraderResetTime";
    /** @deprecated Use Trader.name type instead. */
    name?: Maybe<Scalars["String"]>;
    /** @deprecated Use Trader.resetTime type instead. */
    resetTimestamp?: Maybe<Scalars["String"]>;
};

export type TraderStanding = {
    __typename?: "TraderStanding";
    standing: Scalars["Float"];
    trader: Trader;
};

export type Vendor = {
    name: Scalars["String"];
    normalizedName: Scalars["String"];
};

export type HistoricalPricePoint = {
    __typename?: "historicalPricePoint";
    price?: Maybe<Scalars["Int"]>;
    priceMin?: Maybe<Scalars["Int"]>;
    timestamp?: Maybe<Scalars["String"]>;
};
