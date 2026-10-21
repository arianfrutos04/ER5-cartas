
export const FPS =  60;

export const GameState = {
    INVALID:       -1,
    LOAD_LANPAGE:   0,
    LANDPAGE:       1,
    LOAD_GAME:      2,
    PLAYING:        3,
    LOAD_GAMEOVER:  4,
    GAMEOVER:       5,
    LOAD_CONTROLS:  6,
    CONTROLS:       7,
    INVALID:        8,
    SEND_DATA:      9,
    QUICK_HELP:     10,
    MENU:           11,
}

export const TurnId = {
    PLAYER_1:               0,
    PLAYER_2:               1,
}

export const TurnStates = {

    INITIALIZE:     0,
    EXECUTION:      1,
    END:            2,
    INVALID:        3,
}
    
export const PhaseStates = {
    DEFAULT:                0,
    DISCARD_CARD:           1,
    DRAW_CARD:              2,
    MOVEMENT:               3,
    ATTACK:                 4,
    PREPARE_EVENT:          5,
    USE_EVENT_CARD:         6,
}

export const AttackState = {
    
    PARRY:                  5,
    SELECT_PARRY_ATTACK:    1,
    ATTACK:                 2,
    DEFAULT:                3,
    PREPARE_SELECT:         4

}

export const MovePhaseStates = {
    NONE:       0,
    MOVE:       1,
    ATTACK:     2,
    SELECT_ATTACKER:    3,
    SELECT_OBJECTIVE:   4,

}

export const CardActions = {
    COOLDOWN:       0,
    READY:          1,
    ON_USE:         2,
    WORN_OUT:       3,
    APPLY_EVENT:    4,
    SET_TURN:       5,
    RESET_ACTION:   6,
    REMOVE_EVENT:   7,
    STUNNED:        8,
    DEFAULT:        9,
}

export const CardId = {
    BIG_SIZE:       0,
    SMALL_SIZE:     1,
    EVENT_SIZE:     2,
    NOT_SELECTED:   3,
    SELECTED:       4,
    HOVER:          5,
    SCALED:         6,
    NOT_ACTIVE:     7,
    ALIVE:          8,
    DEAD:           9,
    ATTACK:         11,
    BLOCKED:        12,
}

export const GridId = {
    BOARD_GRID:             0,
    PLAYER_1_EVENT_GRID:    1,
    PLAYER_2_EVENT_GRID:    2,
    PLAYER_1_HAND_GRID:     3,
    PLAYER_2_HAND_GRID:     4,
} 

export const SlotsState = {
    NOT_SELECTED:   0,
    SELECTED:       1,
    HOVER:          2
}

export const ButttonsId = { 
    BTN_MOVE:               0,
    BTN_PREPARE_EVENT:      1,
    BTN_USE_EVENT:          2,
    BTN_ATTACK:             3,
    BTN_END_TURN:           4,
    BTN_CHANGE_LANGUAGE:    5,
    BTN_RETURN_TO_MENU:     6,
    BTN_QUICK_HELP:         7,
    BTN_PARRY:              8,
    BTN_NO_PARRY:           9,
    BTN_LEFT:               10,
    BTN_RIGHT:              11,
    BTN_LEAVE_QUICK_HELP:   12,
    BTN_RETURN_TO_GAME:     13,
    BTN_RETURN_TO_LOBBY:    14,
}

export const ButtonState = {
    NOT_SELECTED:   0,
    SELECTED:       1,
    HOVER:          2
}

export const Joseph = {
    NOT_ACTIVE:   0,
    ACTIVE:       1,
    HOVER:        2
}

export const ImageTypes = {
    CARD_IMAGE:  0,
    CARD_BORDER: 1,
    CARD_ICONS: 2,
    CARD_RARITY: 3,
    EQUIP_RARITY: 4,
    GAME_RARITY:5,
    CARD_TYPE: 6,
    BOARD_IMAGE: 7,
    TEAM: 8,
    BUTTON: 9,
    CHAT_BUBBLE: 10,
    QUICK_HELP: 11,
    PARTICLE: 12,
    BUTTON_ICONS: 13,
}
export const CardImageId = {
    JOSEPH:     1,
    LUCRETIA:   2,
    ANGELO:     9,
    THRONE:    10,
    XG:        11,

}
export const BorderId = {
    NORMAL_SIZE: 0,
    SMALL_SIZE: 1,
    REVERSE: 2,
    HOVER: 3,
    SELECTED: 4,
    MINI_HOVER: 5,
    MINI_SELECTED: 6,
    EVENT_HOVER: 7,
    EVENT_SELECTED: 8
}
export const VFXId = {
    SELECTED: 0,
    HOVER: 1
}
export const StatsId = {
    DAMAGE:     0,
    DEFENSE:    1,
    LIFE:       2,
    SPEED:      3,
    RANGE:      4,
    DURABILITY: 5,
    COOLDOWN:   6,
}
export const IconsId = {
    LIFE:       0,
    DEFENSE:    1,
    DAMAGE:     2,
    SPEED:      3,
    DURABILITY: 4,
    COOLDOWN:   5,
    WEAPON:         6,
    ARMOR:          7,
    MINI_LIFE:      8,
    MINI_DEFENSE:   9,
    MINI_DAMAGE:   10,
    MINI_SPEED:    11,
    MINI_WEAPON:   12,
    MINI_ARMOR:    13,
}
export const TypeId = {
    MINION: 0,
    BUFF: 1,
    CURSE:2,
    HERO:3,
    JOSEPH:4,
    ARMOR:5,
    WEAPON:6,
    SPELL: 7,
}
export const TypeNames = [["Minion", "Morroia"], ["Buff", "Indartzea"], ["Curse", "Madarikazioa"], ["Hero", "Heroia"], ["Joseph", "Joseph"], ["Armor", "Armadura"], ["Weapon", "Arma"], ["Spell", "Sorginkeria"]]

export const RarityId = {
    COMMON:         0,
    RARE:           1,
    EPIC:           2,
    LEGENDARY:      3,
    NONE:           4,
    MINI_COMMON:    5,
    MINI_RARE:      6,
    MINI_EPIC:      7,
    MINI_LEGENDARY: 8,
    MINI_NONE:      9,
}
export const DecksId = {
    INITIAL_DECK:                  -1,
    PLAYER_1_MINION_DECK:           0,
    PLAYER_2_MINION_DECK:           1,
    PLAYER_1_HAND_DECK:             2,
    PLAYER_2_HAND_DECK:             3,
    PLAYER_1_ACTIVE_MINION_DECK:    4,
    PLAYER_2_ACTIVE_MINION_DECK:    5,
    PLAYER_1_PREPARING_EVENT_DECK:  6,
    PLAYER_2_PREPARING_EVENT_DECK:  7,
    EVENT_DECK:                     8,
    MAIN_CHARACTER_DECK:            9,
    GRAVEYARD_DECK:                10,
    JOSEPH_DECK:                   11
}
export const LanguageId = {
    ENG : 0,
    EUS : 1,
}

export const EventsId = {
    COOLDOWN:   0,
    DURABILITY: 1
}
export const BoardId = {
    BOARD:              0,
    EVENT_DECK_EMPTY:   1,
    EVENT_DECK_HALF:    2,
    EVENT_DECK_FULL:    3,
    MINION_DECK_EMPTY:  4,
    MINION_DECK_HALF:   5,
    MINION_DECK_FULL:   6,
    GEM:                7,
    DECK_FRAME_TOP:     8,
    DECK_FRAME_BOTTOM:  9,
    GAME_OVER:          10,
}

export const IconsPos = {
    IMAGE_X:[3,0],
    IMAGE_Y:[15,0],
    NAME: 0,
    DESCRIPTION: 1,
    NAME_X:121,
    NAME_Y:238,
    DESCRIPTION_X:125,
    DESCRIPTION_Y:191,
    RARITY_X:[100,60,30],
    RARITY_Y:[-5,0,30],
    CATEGORY_X:115,
    CATEGORY_Y:353,
    FIRST_ICON_X:[215,100, 70],
    FIRST_ICON_Y:[345,50, 20],
    FIRST_ICON_NUMBER_X:[205,90, 60],
    FIRST_ICON_NUMBER_Y:[359,63, 30],
    SECOND_ICON_X:[175,100, 70],
    SECOND_ICON_Y:[345,90, 55],
    SECOND_ICON_NUMBER_X:[165,90, 60],
    SECOND_ICON_NUMBER_Y:[359,102, 65],
    THIRD_ICON_X:[85,10, 0],
    THIRD_ICON_Y:[345,50, 20],
    THIRD_ICON_NUMBER_X:[75,42, 30],
    THIRD_ICON_NUMBER_Y:[359,63, 30],
    FOURTH_ICON_X:[35,10, 0],
    FOURTH_ICON_Y:[345,90, 55],
    FOURTH_ICON_NUMBER_X:[25,42, 30],
    FOURTH_ICON_NUMBER_Y:[359,102, 65],
    WEAPON_X:[10,22],
    WEAPON_Y:[15,10],
    ARMOR_X:[191,91],
    ARMOR_Y:[15,10],
    PLAYER_X:[10,143],
    PLAYER_Y:[700,215],
    PLAYER_NAME_X: [187,100],
    PLAYER_NAME_Y: [774,297],
    VFX_X:[-25,-13,-10],
    VFX_Y:[-40,-15,-10],
    EVENT_FADE_WIDTH: 92.667,
    EVENT_FADE_HEIGTH: 92.833,
    EVENT_CD_X: 29,
    EVENT_CD_Y: 47,
    EVENT_CD_IMAGE_X: 48,
    EVENT_CD_IMAGE_Y: 35,
    ACTIONS_LEFT_X: 1644,
    ACTIONS_LEFT_Y:120,
    TEAM_X: 53,
    TEAM_Y: 132,
    SCALED_WEAPON_X: -228,
    SCALED_WEAPON_Y: 50,
    SCALED_ARMOR_X: 400,
    SCALED_ARMOR_Y: 50,
    JOSEPH_X: 67,
    JOSEPH_Y: 77,
    TURN_TIMER_X: 1551,
    TURN_TIMER_Y: 537,
    EVENT_STATE_X: 44,
    EVENT_STATE_Y: 77,
    CHAT_BUBBLE_X: [400,170],
    CHAT_BUBBLE_Y: [150,830],
    CHAT_TEXT_X: [447,286],
    CHAT_TEXT_Y: [166,642],
    JOSEPH_CHAT_TEXT_X: 1628,
    JOSEPH_CHAT_TEXT_Y: 290,
    CHAT_TEXT_MAX_WIDTH: 270
}
export const MAXIMUN_CARDS_IN_HAND = 5

export const MessageState = {
    APPEAR: 0,
    ON:     1,
    FADE:   2,
    OFF:    3,
}

export const MessageType = {
    DAMAGE_MESSAGE:      0,
    HELP_MESSAGE:        1,
    CHANGE_TURN_MESSAGE: 2,
    CHAT_MESSAGE:        3
}

export const HelpMessagesPos = {
    X_POS:  1713,
    Y_POS:   916,
}

export const ParticleState = {
    APPEAR: 0,
    ON:     1,
    FADE:   2,
    OFF:    3,
}

export const TimerId = {
    TURN_TIMER:     0,
    DISCARD_TIMER:  1,
    TOOLTIP_TIMER:  2,
}

export const BaseURL= [
    "http://localhost:3000",
    "https://er5-server.onrender.com" 
]

// 0 for localhost base-url
// 1 for render base-url

export const BaseURLValue = 0

export const TooltipText = {
    NAME:   ["Name: ", "Izena: "],
    TYPE:   ["Type:", "Mota:"],
    RANGE:  ["Range:", "Irismena:"],
}

export const ReturnToMenuText = {
    FIRST_LINE:     ["Do you want to return", "Menu nagusira"],
    SECOND_LINE:    ["to main menu?", "itzuli nahi duzu?"],
}

export const GameOverText = {
    TITLE:              ["GAME OVER", "PARTIDA AMAITUTA"],
    WINNER:             ["Winner: ", "Irabazlea: "],
    LOSER:              ["Loser: ", "Galtzailea: "],
    MELEE_HITS:         ["Melee Hits: ", "Gertuko erasoak: "],
    RANGED_HITS:        ["Ranged Hits: ", "Urrutiko erasoak: "],
    DAMAGE_DONE:        ["Damage Done: ", "Eragindako kaltea: "],
    DAMAGE_RECEIVED:    ["Damage Received: ", "Jasotako kaltea: "],
    RETURN_TO_LOBBY:    ["Click to return to lobby.", "Egin klik egongelara itzultzeko."],
}

export const CombatText = {
    DEAD:           ["DEAD", "HILDA"],
    WEAPON_BROKEN:  ["WEAPON BROKEN", "ARMA HAUTSITA"],
    ARMOR_BROKEN:   ["ARMOR BROKEN", "ARMADURA HAUTSITA"],
    CRITICAL:       ["!! CRITICAL", "!! KRITIKOA"],
    BLUNT:          ["BLUNT", "HUTS EGIN"],
    BLOCKED:        ["BLOCKED", "BLOKEATUTA"],
    BLOCK_BLUNT:    ["BLOCK BLUNT ", "BLOKEO HUTSA "],
}

export const QuickHelpText = {
    BASICS_TITLE:   ["GAME BASICS", "OINARRIAK"],
    BASICS:         [
        ["At the start of the game, each player is given a random main character and draws 5 cards from the event deck.",
         "Partidaren hasieran, jokalari bakoitzari pertsonaia nagusi bat esleitzen zaio ausaz eta 5 txartel ateratzen ditu gertaeren sortatik."],
        ["At the start of each turn, all active events are executed. If one of your minions has been destroyed, another one will spawn automatically.",
         "Txandaren hasieran, aktibo dauden gertaera guztiak exekutatzen dira. Zure minioietako bat suntsitu badute, beste bat agertuko da automatikoki."],
        ["At the end of your turn, all minions restore their default values, so you won't be able to kill a minion by attacking it over 2 different turns.",
         "Zure txandaren amaieran, minioi guztiek hasierako balioak berreskuratzen dituzte; beraz, ezin izango duzu minioi bat hil bi txanda desberdinetan erasoz."],
        ["The game ends when one of the players loses all their health points, which means running out of minions.",
         "Partida jokalarietako batek bizitza-puntu guztiak galtzen dituenean amaitzen da, hau da, minioirik gabe geratzen denean."],
    ],
    PHASES_TITLE:   ["TURN PHASES", "TXANDAREN FASEAK"],
    PHASES:         [
        {
            TITLE:      ["DRAW PHASE", "ATERATZE FASEA"],
            TEXT:       [["Happens automatically. You draw 1 event card if you have 4 or fewer cards in your hand.",
                          "Automatikoki gertatzen da. Gertaera-txartel bat ateratzen duzu eskuan 4 txartel edo gutxiago badituzu."]],
        },
        {
            TITLE:      ["ACTION PHASE", "EKINTZA FASEA"],
            TEXT:       [["Each turn you can perform up to 3 actions. Choose the action you want with the buttons on the left:",
                          "Txanda bakoitzean gehienez 3 ekintza egin ditzakezu. Aukeratu nahi duzun ekintza ezkerreko botoiekin:"]],
            ACTIONS:    [["Move minion", "Minioia mugitu"], ["Prepare event", "Gertaera prestatu"], ["Use event", "Gertaera erabili"], ["Attack", "Eraso"]],
        },
        {
            TITLE:      ["DISCARD PHASE", "BAZTERTZE FASEA"],
            TEXT:       [["Once all your actions are used or the End Turn button has been clicked, if you have 5 or more cards in your hand, you must choose one of them to discard.",
                          "Ekintza guztiak erabili dituzunean edo txanda amaitzeko botoia sakatu duzunean, eskuan 5 txartel edo gehiago badituzu, eskuko txartel bat aukeratu beharko duzu baztertzeko."],
                         ["You must choose a card within the time limit; otherwise, one will be discarded at random.",
                          "Txartela emandako denboraren barruan aukeratu behar duzu; bestela, ausaz baztertuko da."]],
        },
    ],
    PAGES:          [
        {
            TITLE:      ["MOVEMENT", "MUGIMENDUA"],
            TEXT:       [["Select the minion you want to move, and the slots it can move to will be highlighted in green.",
                          "Aukeratu mugitu nahi duzun minioia, eta mugi daitekeen zirrikituak berdez agertuko dira."],
                         ["These are limited by the minion's speed.",
                          "Minioiaren abiadurak mugatzen ditu."]],
        },
        {
            TITLE:      ["ATTACK", "ERASOA"],
            TEXT:       [["Select the minion you want to attack with, and the slots it can attack will be highlighted.",
                          "Aukeratu erasotzeko erabili nahi duzun minioia, eta eraso daitezkeen zirrikituak agertuko dira."],
                         ["These are limited by the minion's attack range, which is 1 by default.",
                          "Minioiaren eraso-irismenak mugatzen ditu. Hasiera batean, 1."],
                         ["If the defender has a weapon equipped, the attack can be blocked. An attack can be a critical (x1.5) or a blunt (x0). Even both!",
                          "Defendatzaileak arma bat jantzita badu, erasoa blokeatu dezake. Erasoa kritikoa (x1,5) edo hutsa (x0) izan daiteke. Baita biak ere!"]],
            LEGEND:     [["Standard attack", "Eraso arrunta"], ["Melee weapon equipped", "Gertuko arma jantzita"], ["Ranged weapon equipped", "Urrutiko arma jantzita"]],
        },
        {
            TITLE:      ["PREPARE EVENT", "GERTAERA PRESTATU"],
            TEXT:       [["Select the card in your hand you want to prepare and place it in any empty slot of your event grid.",
                          "Aukeratu prestatu nahi duzun eskuko txartela eta jarri zure gertaeren laukiko edozein zirrikitu hutsetan."],
                         ["As soon as a card is placed on the event grid, its cooldown starts: it can't be used until the cooldown reaches 0.",
                          "Txartela gertaeren laukian jarri bezain laster, itxaronaldia hasiko da: ezin izango da erabili itxaronaldia 0ra iritsi arte."],
                         ["When the cooldown reaches 0, you can use the card whenever you want. Some special cards are applied instantly when their cooldown is over.",
                          "Itxaronaldia 0ra iristen denean, nahi duzunean erabili ahal izango duzu. Txartel berezi batzuk berehala aplikatzen dira itxaronaldia amaitzean."]],
        },
        {
            TITLE:      ["USE EVENT", "GERTAERA ERABILI"],
            TEXT:       [["Select the event you want to use in your event grid, then select the target to apply it to.",
                          "Aukeratu erabili nahi duzun gertaera zure gertaeren laukian eta aukeratu zeini aplikatu."],
                         ["Depending on the event, the target must be an ally or an enemy.",
                          "Aukeratutako gertaeraren arabera, helburua aliatu bat edo etsai bat izango da."],
                         ["Once applied, the event starts losing durability and is destroyed when its durability reaches 0.",
                          "Gertaera aplikatzen denean iraunkortasuna galtzen hasiko da, eta iraunkortasuna 0ra iristean suntsituko da."]],
        },
    ],
}

export const messageDefaultPhase        = ["Select any button to enter in the phase", "Aukeratu edozein botoi fasean sartzeko"];

export const messageDiscardPhase        = ["Select any card to discard", "Aukeratu baztertzeko edozein txartel"];

export const messageAttackPhase1        = ["Select any attacker minion", "Aukeratu minioi erasotzaile bat"];
export const messageAttackPhase2        = ["Select any enemy minion to attack", "Aukeratu edozein minioi etsai erasotzeko"];

export const messageMovimentPhase1      = ["Select any minion to move", "Aukeratu minioi bat mugitzeko"];
export const messageMovimentPhase2      = ["Select any slot to move the minion", "Aukeratu edozein zirrikitu minioia mugitzeko"];

export const messagePrepareEventPhase1  = ["Select any event card to prepare", "Aukeratu prestatu beharreko edozein gertakari-txartel"];
export const messagePrepareEventPhase2  = ["Select any slot of the event grid to start to preparing the event card", "Aukeratu edozein zirrikitu gertaeraren txartela prestatzen hasteko"];

export const messageUseEventPhase1      = ["There are no cards in the event grid, Select other action", "Ez dago txartelik ekitaldien laukian, aukeratu beste ekintza bat"];
export const messageUseEventPhase2      = ["Select any prepared event card to use", "Aukeratu erabili beharreko ekitaldietarako txartel prestatua"];
export const messageUseEventPhase3      = ["Select any minion to use the event card", "Aukeratu edozein minioi gertaeraren txartela erabiltzeko"];

export const BlockStates = {
    INVALID:         -1,
    COMPLETE_BLOCK:   0,
    PARCIAL_BLOCK:    1,
    FAILED_BLOCK:     2,
}

export const renderState = {
    GAME:       0,
    PARRY:      1,
    QUICK_HELP: 2,
    MENU:       3,
}

export const ScreenSize = {
    X_SIZE: 1920,
    Y_SIZE: 1080,
}

export const Team = {
    ATTACKER: 0,
    DEFENDER: 1,
}

export const MainCharacterId = {
    LUCRETIA:           2,
    ANGELO:             9,
    DECREPIT_TRHONE:    10,
    X_G_SCHOLAR:        11
}

export const BuffId = {
    TELEPORT: 46,
    TOAST: 47,
    HERO_EMPOWERMENT:   53,
    DECEPTION:          49
}

export const CurseId = {
    MOLOTOV_COCKTAIL:   39,
}

export const DurabilityColors = {
    ARMOR:  "#A9A9A9",
    WEAPON: "#800000",
    SPELL:  "#800080",
    CURSE:  "#000000",
    BUFF:   "#FFD700"
}

export const TypeColors = ["red", DurabilityColors.BUFF, DurabilityColors.CURSE, DurabilityColors.BUFF, "white", DurabilityColors.ARMOR, DurabilityColors.WEAPON, DurabilityColors.SPELL];


export const ChatMessages = {
    LUCRETIA:   [["Do not challenge me or you will regret it.", "Ez niri erronkarik egin edo damutuko zara."],
                 ["I see in the cauldron your fate, it says you will perish.","Kalderoan ikusten dut zure patua, hilko zarela dio."],
                 ["The moon reveals more than shadows so do not try to hide in the dark.","Ilargiak itzalak baino gehiago erakusten du, beraz, ez saiatu ilunpetan ezkutatzen."]],

    ANGELO:     [["Through the alchemy of the mind, I have unlocked the secrets of eternal vitality.","Gogoaren alkimiaren bidez, betiko bizitasunaren sekretuak desblokeatu ditut."],
                 ["In the Etazium elixir lies the immortality, distilled from the essence of the stars.","Etazium elixirrean dago hilezkortasuna, izarren esentziatik destilatua."],
                 ["With each sip of the potion, time itself bends to my will, and mortality banishes.","Edabearen trago bakoitzarekin, denbora bera makurtzen da nire nahiera, eta hilkortasuna baztertu egiten da."]],

    XG:         [["I feel my blood boiling in the face of challenges, despite descending from wizards.","Odola irakiten sentitzen dut erronken aurrean, aztietatik jaitsi arren."],
                 ["I was born in Evil Tongues, wrestling with my ancestor's legacy.","Evil Tongues-en jaio nintzen, nire arbasoen ondarearekin borrokan."],
                 ["My glasses reflects your face, scared to the bones.","Nire betaurrekoek zure aurpegia islatzen dute, hezurretaraino beldurtuta."]],
                 
    THRONE:     [["Try to posses me, If you dare.","Saiatu ni jabetzen, ausartzen bazara."],
                 ["Come... Sit here...","Etorri... Eseri hemen..."],
                 ["I dont belong to this Era,but I'll posses it.","Ez naiz garai honetakoa, baina jabetuko naiz."]],

    JOSEPH:     [["I am no longer a sane man but a vessel of the throne.","Jada ez naiz gizon sanoa, tronuko ontzi bat baizik."],
                 ["With each passing moment, the throne is consuming me from within.","Pasaten den une bakoitzean tronuak barnetik kontsumitzen nau."],
                 ["THE CHAIR, WHERE'S MY CHAIR?","AULKIA, NON DAGO NIRE AULKI?"]],

    MINION:     [["",""],
                 ["",""],
                 ["",""]]



}

export const Sound = {
    NO_SOUND:      -1,
    GAME_MUSIC:     0,
    ATTACK_SWORD:   1,
    ATTACK_CRIT:    2,
    ATTACK_MISS:    3,
    ATTACK_PUNCH:   4,
    ATTACK_PUNCH_CRIT: 5,
    EQUIP_ARMOR:    6,
    MOVEMENT:       7,
    FIREBALL:       8,
    BUFF:           9,
    CURSE:          10,
    DEAD:           11,
    DRAW:           12
}

export const BoardCardSizes = {
    X_SIZE: 133,
    Y_SIZE: 155,
}

export const ParticleId = {
    MOVIMENT:   0,
    ATTACK:     1,
}