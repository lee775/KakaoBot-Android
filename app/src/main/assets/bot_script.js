// ==========================================
// KakaoBot 통합 스크립트 (code.txt 병합)
// ==========================================

// 관리자 목록
var ADMINS = ["덕고미콩","페에멜라","늘귤","아퐁","영디","좋냥","화령작","이렐프리데","코코섬/그리즈","별희연","키보입니다만","코코섬","루나지봉이"];

// 관리자 확인 함수
function isAdmin(sender) {
    for (var i = 0; i < ADMINS.length; i++) {
        if (ADMINS[i] === sender) {
            return true;
        }
    }
    return false;
}

// 벽지 데이터 관리 함수들
function getWallData(room) {
    try {
        var data = DataBase.getDataBase("wall_" + room);
        if (data && data !== "") {
            return JSON.parse(data);
        }
        return {};
    } catch (e) {
        return {};
    }
}

function saveWallData(room, data) {
    try {
        DataBase.setDataBase("wall_" + room, JSON.stringify(data));
    } catch (e) {
        // 저장 실패 무시
    }
}

function registerWall(room, sender, content, replier) {
    var wallData = getWallData(room);
    
    if (wallData[sender]) {
        replier.reply("한 사람당 하나의 글만 등록 할 수 있습니다.(/삭제)");
        return;
    }
    
    wallData[sender] = content;
    saveWallData(room, wallData);
    replier.reply("글이 /벽지 에 등록 되었습니다.");
}

function adminRegisterWall(room, sender, targetUser, adminContent, replier) {
    if (!isAdmin(sender)) {
        replier.reply("⛔ 관리자만 사용할 수 있는 명령어입니다.");
        return;
    }
    
    var wallData = getWallData(room);
    wallData[targetUser] = adminContent;
    saveWallData(room, wallData);
    replier.reply("👑 관리자 권한으로 [" + targetUser + "] 이름의 글이 등록되었습니다.");
}

function deleteWall(room, sender, replier) {
    var wallData = getWallData(room);
    
    if (!wallData[sender]) {
        replier.reply("등록된 글이 없습니다.");
        return;
    }
    
    delete wallData[sender];
    saveWallData(room, wallData);
    replier.reply("글이 /벽지 에서 지워졌습니다.");
}

function adminDeleteWall(room, sender, targetUser, replier) {
    if (!isAdmin(sender)) {
        replier.reply("⛔ 관리자만 사용할 수 있는 명령어입니다.");
        return;
    }
    
    var wallData = getWallData(room);
    
    if (!wallData[targetUser]) {
        replier.reply("👑 [" + targetUser + "]의 등록된 글이 없습니다.");
        return;
    }
    
    delete wallData[targetUser];
    saveWallData(room, wallData);
    replier.reply("👑 관리자 권한으로 [" + targetUser + "]의 글이 삭제되었습니다.");
}

function clearAllWall(room, sender, replier) {
    if (!isAdmin(sender)) {
        replier.reply("⛔ 관리자만 사용할 수 있는 명령어입니다.");
        return;
    }
    
    saveWallData(room, {});
    replier.reply("👑 관리자 권한으로 벽지가 전체 초기화되었습니다.");
}

function showWall(room, replier) {
    var wallData = getWallData(room);
    var message = "📋 벽지\n\n";
    var hasData = false;
    
    for (var user in wallData) {
        if (wallData.hasOwnProperty(user)) {
            message += user + " : " + wallData[user] + "\n\n";
            hasData = true;
        }
    }
    
    if (!hasData) {
        replier.reply("📋 벽지\n\n등록된 글이 없습니다.");
        return;
    }
    
    replier.reply(message.trim());
}


// ==========================================
// 유틸리티 함수
// ==========================================
// 나머지 함수들
function starf(num1, num2, replier) {
    var steps = [
        { from: 15, to: 16, succ: 31.5, dest: 2.055 },
        { from: 16, to: 17, succ: 31.5, dest: 2.055 },
        { from: 17, to: 18, succ: 15.75, dest: 6.74 },
        { from: 18, to: 19, succ: 15.75, dest: 6.74 },
        { from: 19, to: 20, succ: 15.75, dest: 6.74 },
        { from: 20, to: 21, succ: 31.5, dest: 10.275 },
        { from: 21, to: 22, succ: 15.75, dest: 12.638 },
        { from: 22, to: 23, succ: 15.75, dest: 16.85 },
        { from: 23, to: 24, succ: 10.5, dest: 17.9 },
        { from: 24, to: 25, succ: 10.5, dest: 17.9 },
        { from: 25, to: 26, succ: 10.5, dest: 17.9 },
        { from: 26, to: 27, succ: 7.35, dest: 17.932 },
        { from: 27, to: 28, succ: 5.25, dest: 18.95 },
        { from: 28, to: 29, succ: 3.15, dest: 19.37 },
        { from: 29, to: 30, succ: 1.05, dest: 19.79 }
    ];

    var start = parseInt(num1, 10);
    var end = parseInt(num2, 10);

    if (isNaN(start) || isNaN(end) || end <= start) {
        replier.reply("잘못된 입력입니다. 시작 강과 목표 강을 확인해 주세요.");
        return;
    }

    var path = [start];
    var cur = start;

    while (cur < end) {
        if (cur < 15) {
            cur += 1;
            path.push(cur);
            continue;
        }

        var row = null;
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].from === cur) {
                row = steps[i];
                break;
            }
        }
        
        if (!row) {
            replier.reply("데이터 없음: " + cur + " → " + (cur + 1));
            return;
        }

        var r = Math.random() * 100;
        if (r < row.dest) {
            path.push(cur + "X");
            replier.reply(cur + "성에서 파괴됨\n과정: " + path.join(" "));
            return;
        } else if (r < row.dest + row.succ) {
            cur += 1;
            path.push(cur);
        } else {
            path.push(cur);
        }
    }

    replier.reply(end + "성 강화 성공!\n경로: " + path.join(" "));
}
function starff(num1, num2, replier) {
    var steps = [
        { from: 15, to: 16, succ: 32.117, dest: 1.438 },
        { from: 16, to: 17, succ: 32.117, dest: 1.438 }, 
        { from: 17, to: 18, succ: 17.772, dest: 4.718 }, 
        { from: 18, to: 19, succ: 17.772, dest: 4.718 }, 
        { from: 19, to: 20, succ: 17.772, dest: 4.718 }, 
        { from: 20, to: 21, succ: 34.583, dest: 7.192 }, 
        { from: 21, to: 22, succ: 19.541, dest: 8.847 },
        { from: 22, to: 23, succ: 15.75, dest: 16.85 },
        { from: 23, to: 24, succ: 10.5, dest: 17.9 },
        { from: 24, to: 25, succ: 10.5, dest: 17.9 },
        { from: 25, to: 26, succ: 10.5, dest: 17.9 },
        { from: 26, to: 27, succ: 7.35, dest: 17.932 },
        { from: 27, to: 28, succ: 5.25, dest: 18.95 },
        { from: 28, to: 29, succ: 3.15, dest: 19.37 },
        { from: 29, to: 30, succ: 1.05, dest: 19.79 }
    ];

    var start = parseInt(num1, 10);
    var end = parseInt(num2, 10);

    if (isNaN(start) || isNaN(end) || end <= start) {
        replier.reply("잘못된 입력입니다. 시작 강과 목표 강을 확인해 주세요.");
        return;
    }

    var path = [start];
    var cur = start;

    while (cur < end) {
        if (cur < 15) {
            cur += 1;
            path.push(cur);
            continue;
        }

        var row = null;
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].from === cur) {
                row = steps[i];
                break;
            }
        }
        
        if (!row) {
            replier.reply("데이터 없음: " + cur + " → " + (cur + 1));
            return;
        }

        var r = Math.random() * 100;
        if (r < row.dest) {
            path.push(cur + "X");
            replier.reply(cur + "성에서 파괴됨\n과정: " + path.join(" "));
            return;
        } else if (r < row.dest + row.succ) {
            cur += 1;
            path.push(cur);
        } else {
            path.push(cur);
        }
    }

    replier.reply(end + "성 강화 성공!\n경로: " + path.join(" "));
}
function suro(replier) {
    replier.reply("수로 점수표(2025/12/30)\n" +
        "━━━ 🏆 만점 달성자 ━━━\n" +
        "- 14만 -\n영디\n" +
        "- 12만 -\n뭘해도우냥\n" +
        "- 11만 -\n처단\n" +
        "- 10만 -\n덕고미콩 굼뱅이상자 늘귤 페에멜라\n" +
        "- 9만 -\n렌영v\n" +
        "- 8만 -\n믈빙건\n" +
        "- 7만 -\n쫀뚜 유랑극단\n" +
        "- 6만 -\n담체 너조아 플로렌스 활쏘러가여\n" +
        "- 5만 -\n좋냥 다크나이이뚜 세렌팬티도둑\n" +
        "- 4만 -\n도혼갓 멍붕바오 태엽준 아퐁 무지개오라 제육쌈밥사장 그리즈\n" +
        "- 3만 -\n살콩 승에 국진시치 noyes비숍 팔라단약한듯 몰랑흥사\n" +
        "- 2만 -\n냥연진 센애 서울꽃삼 장덕동소나미 나우테크시치 가령성우펜 아오렌시치\n" +
        "- 1만 -\n대머리공장장 TreySongz 수심각 초전도건틀릿 라인카적 태준바라깅 꼬마모찌 유랑준 홈추는신뚜형 질풍준 금발태닝께보 별의탈빛시수 엘리맵 파이난류화 유토피 비표본위험 나준혁 태준시치 토모으는자 총을써보자 태즌v 씨단 페문 바텀바투기 메Lia 홍군리 진담토\n\n" +
        "     - 헤르메스 -");
}

function calc(num1, num2, replier) {
    var skillcore_energy = [
        5, 1, 1, 1, 2, 2, 2, 3, 3, 10,
        3, 3, 4, 4, 4, 4, 4, 4, 5, 15,
        5, 5, 5, 5, 5, 6, 6, 6, 7, 20
    ];

    var skillcore_fragments = [
        100, 30, 35, 40, 45, 50, 55, 60, 65, 200,
        80, 90, 100, 110, 120, 130, 140, 150, 160, 350,
        170, 180, 190, 200, 210, 220, 230, 240, 250, 500
    ];
    
    var skillcore1 = 0;
    var skillcore2 = 0;
    for (var i = num1; i < num2; i++) {
        skillcore1 = skillcore1 + skillcore_energy[i];
        skillcore2 = skillcore2 + skillcore_fragments[i];
    }
    
    var mastery_energy = [
        3, 1, 1, 1, 1, 1, 1, 2, 2, 5,
        2, 2, 2, 2, 2, 2, 2, 2, 3, 8,
        3, 3, 3, 3, 3, 3, 3, 3, 4, 10
    ];

    var mastery_fragments = [
        50, 15, 18, 20, 23, 25, 28, 30, 33, 100,
        40, 45, 50, 55, 60, 65, 70, 75, 80, 175,
        85, 90, 95, 100, 105, 110, 115, 120, 125, 250  
    ];
    
    var masterycore1 = 0;
    var masterycore2 = 0;
    for (var mi = num1; mi < num2; mi++) {
        masterycore1 = masterycore1 + mastery_energy[mi];
        masterycore2 = masterycore2 + mastery_fragments[mi];
    }
    
    var enhance_energy = [
        4, 1, 1, 1, 2, 2, 2, 3, 3, 8,
        3, 3, 3, 3, 3, 3, 3, 3, 4, 12,
        4, 4, 4, 4, 4, 5, 5, 5, 6, 15
    ];

    var enhance_fragments = [
        75, 23, 27, 30, 34, 38, 42, 45, 49, 150,
        60, 68, 75, 83, 90, 98, 105, 113, 120, 263,
        128, 135, 143, 150, 158, 165, 173, 180, 188, 375
    ];
    
    var enhancecore1 = 0;
    var enhancecore2 = 0;
    for (var ei = num1; ei < num2; ei++) {
        enhancecore1 = enhancecore1 + enhance_energy[ei];
        enhancecore2 = enhancecore2 + enhance_fragments[ei];
    }
    
    var common_energy = [
        7, 2, 2, 2, 3, 3, 3, 5, 5, 14,
        5, 5, 6, 6, 6, 6, 6, 6, 7, 17,
        7, 7, 7, 7, 7, 9, 9, 9, 10, 20
    ];

    var common_fragments = [
        125, 38, 44, 50, 57, 63, 69, 75, 82, 300,
        110, 124, 138, 152, 165, 179, 193, 207, 220, 525,
        234, 248, 262, 275, 289, 303, 317, 330, 344, 750 
    ];
    
    var commoncore1 = 0;
    var commoncore2 = 0;
    for (var ci = num1; ci < num2; ci++) {
        commoncore1 = commoncore1 + common_energy[ci];
        commoncore2 = commoncore2 + common_fragments[ci];
    }
    
    if (num1 < 0 || num1 >= num2 || num2 > 30 || num2 < 1) {
        replier.reply("범위 설정이 유효하지 않습니다.");
    } else {
        replier.reply(
            num1 + "레벨에서 " + num2 + "레벨까지\n<스킬 코어>\n솔 에르다 :" +
            skillcore1 + "개\n" +
            "솔 에르다 조각 : " + skillcore2 + "개\n" +
            "<마스터리 코어>\n솔 에르다 :" +
            masterycore1 + "개\n" +
            "솔 에르다 조각 : " + masterycore2 + "개\n" +
            "<강화 코어>\n솔 에르다 :" +
            enhancecore1 + "개\n" +
            "솔 에르다 조각 : " + enhancecore2 + "개\n" +
            "<공용 코어>\n솔 에르다 :" +
            commoncore1 + "개\n" +
            "솔 에르다 조각 : " + commoncore2 + "개"
        );
    }
}

function money(replier) {
    var openers = [
        "여긴 길드의 심장부, 창고 앞이다.",
        "모든 물품은 수호자의 눈 아래에 있다.",
        "허락받지 못한 자, 발걸음을 멈춰라.",
        "열쇠가 없다면 문은 결코 열리지 않는다.",
        "보물의 향기에 홀린 자들, 이 앞을 넘지 못한다.",
        "한 번이라도 손댄다면, 내 검이 먼저 반응할 것이다.",
        "여긴 거래의 장소가 아니라 신뢰의 증거다.",
        "창고의 무게는 길드의 명예와 같다.",
        "낯선 손길은 모두 봉인에 삼켜진다.",
        "안심하라, 너의 물품은 철벽보다 안전하다.",
        "길드의 피와 땀이 쌓인 곳… 가벼이 대하지 마라.",
        "수호자는 잠들지 않는다.",
        "문은 오직 주인의 이름에만 반응한다.",
        "물건 하나하나에 모두 역사가 깃들어 있다.",
        "배신자는 창고 앞에서 드러나게 마련이다.",
        "네가 맡긴 물품, 내가 목숨 걸고 지킨다.",
        "창고를 지키는 건 단순한 일이 아니다.",
        "무겁지만, 반드시 지켜야 할 자리다.",
        "길드와 함께한 시간만큼, 이 창고도 살아있다.",
        "자, 필요한 게 있다면 권한을 보여라.",
        "수호자의 눈은 어둠 속에서도 꺼지지 않는다.",
        "이 문을 두드리는 순간, 네 정체가 드러난다.",
        "허술한 자는 창고의 숨결조차 느끼지 못하리.",
        "길드의 신뢰가 없으면, 이 문은 적이 된다.",
        "창고의 돌 하나에도 서약이 새겨져 있다.",
        "들고 나가는 순간, 그 무게는 곧 네 책임이 된다.",
        "손길이 흔들리면 봉인이 먼저 널 심판할 것이다.",
        "검은 손길은 빛을 만나 사라지리라.",
        "잠깐의 욕심이 길드 전체를 위협할 수 있다.",
        "나는 창고와 함께 살아온 그림자다.",
        "네 발자취는 이 문 앞에서 모두 기록된다.",
        "길드의 자산은 곧 길드의 생명이다.",
        "믿음을 저버린 자, 이곳은 그들의 무덤이 된다.",
        "네 목소리, 네 이름, 네 의지가 열쇠다.",
        "자물쇠는 금속이 아니라 신뢰로 만들어졌다.",
        "수호자의 맹세는 흔들리지 않는다.",
        "여긴 단순한 금고가 아니라 길드의 영혼이다.",
        "창고의 문은 무겁지만, 배신의 대가는 더 무겁다.",
        "네가 지켜야 할 것이 있다면, 이 무게를 이해하라.",
        "제이엠을 아는가?"
    ];

    var intro = openers[Math.floor(Math.random() * openers.length)];
    var amount = "110,000,000,000";
    var rate = "100";
    
    replier.reply(
        intro + "\n\n" +
        "플로창고\n보유 메소 : " + amount +
        "\n조각 : " + rate + "\n"
    );
}

function cody(replier) {
    replier.reply("https://meaegi.com/dressing-room");
}

function foodchoice(replier) {
    var foods = [
        "김치찌개", "된장찌개", "불고기", "비빔밥", "삼겹살", "떡볶이", "순대국", "치킨",
        "피자", "스파게티", "햄버거", "샌드위치", "초밥", "우동", "라멘", "쌀국수", "볶음밥",
        "짜장면", "짬뽕", "탕수육", "마라탕", "카레라이스", "갈비탕", "감자탕", "부대찌개",
        "해물파전", "족발", "보쌈", "김밥", "라면", "냉면", "칼국수", "닭갈비", "쭈꾸미볶음",
        "아구찜", "해물찜", "돼지국밥", "곱창", "막창", "순대볶음", "치즈돈까스", "규동", "스시롤",
        "텐동", "덮밥", "에그스크램블", "오믈렛", "토스트", "브런치", "핫도그", "타코", "나쵸",
        "부리또", "팬케이크", "와플", "치즈볼", "감바스", "파스타", "리조또", "피쉬앤칩스", "양갈비",
        "스테이크", "폭립", "로스트치킨", "치킨커리", "쉬림프박스", "타이그린커리", "팟타이", "팟카파오",
        "똠얌꿍", "볶음우동", "장어덮밥", "카츠동", "규카츠", "가츠산도", "야끼소바", "야끼우동"
    ];

    var randomIndex = Math.floor(Math.random() * foods.length);
    var selectedFood = foods[randomIndex];
    replier.reply("오늘은 이거다! 🍽️" + selectedFood);
}

var NEXON_API_KEY = "live_7a3074bd54665cadd86920528d44eac7700ae3f8853a3ff626d42db3f7b301f6efe8d04e6d233bd35cf2fabdeb93fb0d";

// ==========================================
// API 상수 & 캐릭터 목록
// ==========================================
var MAPLE_OCID_API_URL = "https://open.api.nexon.com/maplestory/v1/id";
var MAPLE_INF_API_URL = "https://open.api.nexon.com/maplestory/v1/character/basic";
var MAPLE_INF_STAT_URL = "https://open.api.nexon.com/maplestory/v1/character/stat";
var MAPLE_GUILD_ID_URL = "https://open.api.nexon.com/maplestory/v1/guild/id";
var MAPLE_GUILD_BASIC_URL = "https://open.api.nexon.com/maplestory/v1/guild/basic";
var MAPLE_ITEM_EQUIPMENT_URL = "https://open.api.nexon.com/maplestory/v1/character/item-equipment";
var MAPLE_SYMBOL_URL = "https://open.api.nexon.com/maplestory/v1/character/symbol-equipment";
var RANKING_CHARACTERS4 = [
"글자",
"Nine",
"태린",
"계란",
"매숭이",
"암적",
"오닉스",
"진격캐넌",
"일육뚜",
"DiamondTT",
"구성학",
"그리프뿔",
"그만",
"넥멘",
"다탱",
"레도",
"루미",
"배슈",
"에덴",
"우까",
"원한",
"위장",
"찐렬이",
"추메",
"충격파",
"파운틴",
"국민말랑",
"그노시스",
"꿈우기",
"너민",
"댕온",
"랭커",
"마비노기",
"미술부",
"샤넬조던",
"솜뎡",
"쑤피",
"예전과다른삶",
"윤기",
"의무장",
"전승학파사서",
"즈히",
"팔로잉",
"필독",
"길팻",
"더러움",
"마제도어",
"뫼잘알",
"별따서너줄께",
"빌콩",
"뿌름",
"샤킹",
"암게",
"천정",
"큐피",
"h락",
"꼬꼬면",
"노땅윤",
"말린문어",
"선봉",
"식중땐",
"오석",
"요들",
"일어나",
"짜낭",
"코얌",
"파이어",
"향나무",
"군제",
"랑벤",
"메르",
"우제",
"이지아",
"종찌님",
"취사",
"쿠마신사",
"Robi",
"두마리",
"번빙",
"신예은",
"써언콜",
"야행",
"응쿵",
"채쓰",
"페이탈",
"Se0ngSh",
"건생",
"권수",
"김시진",
"똥각",
"백셍",
"시닛",
"아스퍼거",
"아이쓰",
"오노",
"쟤앙",
"혼니",
"화인",
"Flex",
"꾸냐",
"꾸삐",
"달콤한달이",
"데허",
"뚠디",
"루하",
"망겜소드워커",
"부배",
"뿔소카",
"산성하",
"셰더",
"엘클",
"열변",
"와석",
"유훈주",
"정본",
"커도야",
"Shana",
"결연",
"낭만외길아크",
"눈의",
"단풍잎",
"댜잇",
"딘욱",
"마그네트",
"배포터",
"벗들",
"보드마카",
"브혜",
"에씽짜증나a",
"여우겸",
"연구실",
"유투브",
"은바다",
"인터",
"찌커",
"철앙",
"커퍼",
"푸키",
"햇빛잡초",
"홈스테이",
"교재",
"구뻠즈",
"꿈가놈",
"냥퍄냥",
"념절",
"달별",
"대쟝",
"론데",
"리채은",
"맘먹",
"발림",
"본배찌",
"산꿀",
"선만쥬",
"아웅백",
"이드리안",
"점푸",
"지앗",
"촐랑데써",
"템템",
"2학년교대생",
"AshyTak",
"난진짜꽃남이",
"냥섭",
"네코",
"눈아",
"몽고",
"삐엉",
"세희",
"소고기먹꼬파",
"우리말",
"착지점",
"채소연",
"코미디빅리그",
"택진",
"STANCE",
"김코",
"띵하원",
"로껄",
"마이동풍",
"매너남",
"밍긋",
"섀지컬",
"아이스오라",
"앞에",
"월단성",
"주딘",
"테이",
"한숍봉",
"흐쀼",
"Loco",
"언능",
"뒤눈",
"쭈뺘",
"캐조쿠",
"탕야",
"헬스하는냅킨",
"최채라",
"만발",
"아란진캐"
]
var RANKING_CHARACTERS3 = [
"플로렌스",
"지봉이",
"빌콩",
"솜뎡",
"백점",
"마적",
"브경"
]
// 랭킹 대상 캐릭터 목록
var RANKING_CHARACTERS = [
 "덕고미콩",
"영디",
"아퐁",
"좋냥",
"가람님",
"굼뱅이상자",
"늘귤",
"렌영v",
"플로렌스",
"활쏘러가여",
"다크나이이뚜",
"담체",
"뭘해도우냥",
"유랑극단",
"너조아",
"믈빙건",
"아스티핀",
"이겜처음함뭐",
"제육쌈밥사장",
"처단",
"가령성우팬",
"그리즈",
"살귤",
"세렌팬티도둑",
"엘리멤",
"쭌뚜",
"초전도건틀릿",
"태준v",
"페에멜라",
"국진시치",
"냥연진",
"비표본위험",
"태엽준",
"그대솜이",
"도횬갓",
"돈모으는자",
"메Lia",
"뿌뿍",
"센애",
"아오렌시치",
"유토피",
"즐거운갈루스",
"춤추는신두형",
"태준시치",
"화령작",
"noyes비숍",
"금발태닝께보",
"꼬마모찌",
"나우테크시치",
"대머리공장장",
"리인카잭",
"무지개오라",
"바텀바두기",
"서울꽃삼",
"씨단",
"아란마2분에1",
"윤하지은",
"장덕동쓰나미",
"태준바라깅",
"팔라딘약한듯",
"햇님뎐",
"TreySongz",
"멍붕바오",
"빨간옷흰바지",
"수심각",
"임중휘",
"징쨩렌",
"코코섬",
"몰랑용사",
"별의달빛사수",
"일일세상",
"최고의할증료",
"나준희",
"뎃카이",
"승에",
"오늘만사또",
"진담토",
"티삼스",
"홍기레렌",
"Rabbitwren",
"가상토벤",
"몸윰",
"페문",
"9번감서윤",
"돌풍준",
"옹균리",
"우루루샤",
"질풍준",
"피어난류화",
"젓걜",
"젼빵씨",
"반색월",
"오멘준",
"섀패마",
"유렬",
"총을써보자",
"아퐁이었던것",
"보마Lia",
    
];
var RANKING_CHARACTERS2 = [
"흥우양파",
"멕시칸보이",
"스커육싹이",
"인수인계",
"호비쥬",
"루나툰",
"벡결",
"솔가실",
"연아루3",
"잡문",
"키보입니다만",
"호영맛소주",
"댈류",
"영히부딱",
"룩셈부",
"리코타비",
"별희연",
"사딜",
"세희아님",
"센드왓",
"솔짱쓰",
"숙대지킴이",
"에스프리아",
"요하네님",
"임패파e",
"감빛상어",
"까만폴암",
"냥심무",
"뇽멍뭉이",
"말숙and금자",
"상록수1234",
"진노의먹보",
"닥닝이",
"레이알펜",
"멘나",
"백합러",
"뿌델팡",
"용카인성",
"렌낭낭이펀치",
"혈묘화",
"노래듣는아델",
"응애1칸",
"주다해a",
"달마름",
"좋아해여",
"나솔기견인데",
"병정1",

]


// ==========================================
// 통합 response() 함수
// ==========================================
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    // ===== 벽지/유틸 기능 =====
    // 벽지 기능
    if (msg.startsWith("/등록 ")) {
        var userContent = msg.slice(4).trim();
        if (userContent === "") {
            replier.reply("등록할 내용을 입력해주세요.\n사용법: /등록 내용");
            return;
        }
        registerWall(room, sender, userContent, replier);
        return;
    }
    
    if (msg === "/삭제") {
        deleteWall(room, sender, replier);
        return;
    }
    
    if (msg === "/벽지") {
        showWall(room, replier);
        return;
    }
    
    if (msg.startsWith("/관리등록 ")) {
        var adminParts = msg.slice(7).trim().split(" ");
        if (adminParts.length < 2) {
            replier.reply("사용법: /관리등록 사용자명 내용");
            return;
        }
        var adminTargetUser = adminParts[0];
        var adminWallContent = adminParts.slice(1).join(" ");
        adminRegisterWall(room, sender, adminTargetUser, adminWallContent, replier);
        return;
    }
    
    if (msg.startsWith("/관리삭제 ")) {
        var deleteTargetUser = msg.slice(7).trim();
        if (deleteTargetUser === "") {
            replier.reply("사용법: /관리삭제 사용자명");
            return;
        }
        adminDeleteWall(room, sender, deleteTargetUser, replier);
        return;
    }
    
    if (msg === "/벽지초기화") {
        clearAllWall(room, sender, replier);
        return;
    }
    
    if (msg === "/관리도움말" || msg === "/관리명령어") {
        if (!isAdmin(sender)) {
            replier.reply("⛔ 관리자만 사용할 수 있는 명령어입니다.");
            return;
        }
        replier.reply(
            "👑 관리자 전용 명령어\n\n" +
            "/관리등록 사용자명 내용\n→ 특정 사용자 이름으로 글 등록\n\n" +
            "/관리삭제 사용자명\n→ 특정 사용자의 글 삭제\n\n" +
            "/벽지초기화\n→ 모든 벽지 내용 삭제\n\n" +
            "/관리도움말\n→ 이 도움말 보기"
        );
        return;
    }
    
    // ===== 캐릭터 등록/조회 =====
    if (msg.startsWith("!캐릭터등록 ")) {
        var charToRegister = msg.slice(7).trim();
        if (charToRegister === "") {
            replier.reply("사용법: !캐릭터등록 캐릭터명");
            return;
        }
        DataBase.setDataBase("char_" + sender, charToRegister);
        replier.reply("캐릭터 [" + charToRegister + "] 등록 완료!\n이제 @@ 만 입력하면 자동으로 조회됩니다.");
        return;
    }

    if (msg === "!캐릭터삭제") {
        DataBase.setDataBase("char_" + sender, "");
        replier.reply("등록된 캐릭터가 삭제되었습니다.");
        return;
    }

    if (msg === "!캐릭터") {
        var myChar = DataBase.getDataBase("char_" + sender);
        if (myChar && myChar !== "") {
            replier.reply("등록된 캐릭터: " + myChar);
        } else {
            replier.reply("등록된 캐릭터가 없습니다.\n사용법: !캐릭터등록 캐릭터명");
        }
        return;
    }

    // 기존 기능들
    if (msg == "/음식") {
        foodchoice(replier);
    }
    if (msg == "/코디") {
        cody(replier);
    }
    if (msg == "/수로") {
        suro(replier);
    }
    
    if (msg.indexOf("검은돈") !== -1 || msg.indexOf("/창고") !== -1) {
        money(replier);
    }
    
    if (msg.startsWith("/6차")) {
        var matches = msg.match(/\/6차\s+(\d+)\s+(\d+)/);
        if (matches) {
            var num1 = parseInt(matches[1]);
            var num2 = parseInt(matches[2]);
            calc(num1, num2, replier);
        } else {
            replier.reply("형식이 잘못되었습니다. 예: /6차 15 16");
        }
    }
    if (msg.startsWith("/스타")) {
        var matches1 = msg.match(/\/스타\s+(\d+)\s+(\d+)/);
        if (matches1) {
            var num11 = parseInt(matches1[1]);
            var num21 = parseInt(matches1[2]);
            starf(num11, num21, replier);
        } else {
            replier.reply("형식이 잘못되었습니다. 예: /스타 15 16");
        }
    }
    if (msg.startsWith("/샤타")) {
        var matches11 = msg.match(/\/샤타\s+(\d+)\s+(\d+)/);
        if (matches11) {
            var num111 = parseInt(matches11[1]);
            var num211 = parseInt(matches11[2]);
            starff(num111, num211, replier);
        } else {
            replier.reply("형식이 잘못되었습니다. 예: /샤타 15 16");
        }
    }

    // ===== 메이플 캐릭터 조회 =====
    if (msg.startsWith("/ㄱㅎㅊ")) {
        var characterName = encodeURIComponent(msg.slice(5).trim());
        getMapleOcid(characterName, replier);
    }
    if (msg.startsWith("/경험치")) {
        var characterName1 = encodeURIComponent(msg.slice(5).trim());
        getMapleOcid(characterName1, replier);
    }
    if (msg === "@@" || msg.startsWith("@@ ")) {
        var aaInput = msg.slice(2).trim();
        var characterName2;
        var targetLevel = null;

        if (aaInput === "") {
            // @@ 만 입력 → 등록된 캐릭터 사용
            var registered = DataBase.getDataBase("char_" + sender);
            if (!registered || registered === "") {
                replier.reply("등록된 캐릭터가 없습니다.\n!캐릭터등록 캐릭터명 으로 먼저 등록해주세요.");
                return;
            }
            characterName2 = registered;
        } else {
            var parts = aaInput.split(" ");
            characterName2 = parts[0];
            targetLevel = parts[1] ? parseInt(parts[1]) : null;
        }

        // 헤르메스 랭킹 명령어 체크
        if (characterName2 === "봄비") {
            getMonthlyRanking(replier);
        } else if (characterName2 === "시계꽃") {
            getMonthlyRanking2(replier);
        } else if (characterName2 === "랭킹") {
            getMonthlyRanking3(replier);
        } else if (characterName2 === "스타") {
            getMonthlyRanking4(replier);
        } else if (targetLevel !== null) {
            getLevelUpPrediction(encodeURIComponent(characterName2), targetLevel, replier);
        } else {
            getMapleOcid(encodeURIComponent(characterName2), replier);
        }
    }
    
    if (msg.startsWith("/ㅌㄹ ")) {
        var power1 = encodeURIComponent(msg.slice(4).trim());
        getPower(power1, replier);
    }
    if (msg.startsWith("/ㅈㅌㄹ ")) {
        var power2 = encodeURIComponent(msg.slice(5).trim());
        getPower(power2, replier);
    }
    if (msg.startsWith("/투력 ")) {
        var power3 = encodeURIComponent(msg.slice(4).trim());
        getPower(power3, replier);
    }
    if (msg === "@@@@" || msg.startsWith("@@@@ ")) {
        var power5Text = msg.slice(4).trim();

        if (power5Text === "") {
            var reg4 = DataBase.getDataBase("char_" + sender);
            if (!reg4 || reg4 === "") {
                replier.reply("등록된 캐릭터가 없습니다.\n!캐릭터등록 캐릭터명 으로 먼저 등록해주세요.");
                return;
            }
            getPower(encodeURIComponent(reg4), replier);
        }
        // 헤르메스 전투력 랭킹
        else if (power5Text === "헤르메스") {
            getPowerRanking(replier, RANKING_CHARACTERS);
        }
        // 시계꽃 전투력 랭킹
        else if (power5Text === "시계꽃") {
            getPowerRanking(replier, RANKING_CHARACTERS2);
        }
        else if (power5Text === "스타") {
            getPowerRanking(replier, RANKING_CHARACTERS4);
        }
        // 개별 캐릭터 전투력 조회
        else {
            getPower(encodeURIComponent(power5Text), replier);
        }
    }
    if (msg === "@@@" || msg.startsWith("@@@ ")) {
        var aaaInput = msg.slice(3).trim();
        if (aaaInput === "") {
            var reg3 = DataBase.getDataBase("char_" + sender);
            if (!reg3 || reg3 === "") {
                replier.reply("등록된 캐릭터가 없습니다.\n!캐릭터등록 캐릭터명 으로 먼저 등록해주세요.");
                return;
            }
            getMonthlyExpHistory(encodeURIComponent(reg3), replier);
        } else {
            getMonthlyExpHistory(encodeURIComponent(aaaInput), replier);
        }
    }
    if (msg.startsWith("/전투력 ")) {
        var power4 = encodeURIComponent(msg.slice(5).trim());
        getPower(power4, replier);
    }
    if (msg.startsWith("/장비 ")) {
        var equipParts = msg.slice(4).trim().split(" ");
        var equipName = encodeURIComponent(equipParts[0]);
        var equipSlot = equipParts[1] || null;
        getEquipment(equipName, replier, equipSlot);
    }
    if (msg.startsWith("/ㅈㅂ ")) {
        var equipParts2 = msg.slice(4).trim().split(" ");
        var equipName2 = encodeURIComponent(equipParts2[0]);
        var equipSlot2 = equipParts2[1] || null;
        getEquipment(equipName2, replier, equipSlot2);
    }

    // ===== 추가 기능 (tmi/보스/확률/환산) =====
    if (msg.startsWith("/tmi ")) {
        var tmiName = encodeURIComponent(msg.slice(4).trim());
        getTmiInfo(tmiName, replier);
    }
    if (msg=="/보스")
    {
      clan(replier);
    }
    if (msg=="/테")
    {
      test(replier);
    }
    if(msg=="/기능" || msg=="/ㄱㄴ")
    {
      option(replier);
    }
    if (msg.startsWith("/확률 ")) {
        var args = msg.slice(4).trim().split(" ");
        var chance = parseInt(args[0]);
        var count = args.length > 1 ? parseInt(args[1]) : 1;

        if (isNaN(chance) || chance < 0 || chance > 100) {
            replier.reply("확률은 0~100 사이의 정수여야 합니다.");
        } else if (isNaN(count) || count <= 0) {
            replier.reply("시도 횟수는 1 이상의 정수여야 합니다.");
        } else if (count > 999999999999) {
            replier.reply("시도 횟수는 999999999999 이하로 설정해주세요.");
        } else {
            starforce(chance, count, replier);
        }
    }

    if (msg.startsWith("/환산 ") && room != "[본메] 전국에반협회") {
        var idlink = encodeURIComponent(msg.slice(4).trim());
        getLink(idlink, replier);
    }

    // ===== 심볼 정보 조회 (/심볼 /세금 /탈세 모두 동일 동작) =====
    if (msg.startsWith("/심볼") || msg.startsWith("/세금") || msg.startsWith("/탈세")) {
        var symbolInput = msg.slice(3).trim();
        var symbolCharName;
        if (symbolInput === "") {
            var regSym = DataBase.getDataBase("char_" + sender);
            if (!regSym || regSym === "") {
                replier.reply("등록된 캐릭터가 없습니다.\n!캐릭터등록 캐릭터명 으로 먼저 등록해주세요.");
                return;
            }
            symbolCharName = regSym;
        } else {
            symbolCharName = symbolInput;
        }
        getSymbolInfo(encodeURIComponent(symbolCharName), replier);
    }
}

// ==========================================
// 메이플 API 함수
// ==========================================


// 목표 레벨까지 레벨업 예상 날짜 계산 함수
function getLevelUpPrediction(characterName, targetLevel, replier) {
    var thread = new java.lang.Thread(function() {
        try {
            function pad(num) {
                return num < 10 ? "0" + num : "" + num;
            }
            
            var baseDate = new Date();
            if (baseDate.getHours() >= 0 && baseDate.getHours() < 6) {
                baseDate.setDate(baseDate.getDate() - 1);
                baseDate.setHours(23, 50, 0, 0);
            }
            
            var today = new Date(baseDate);
            
            // 경험치 테이블
            var expToNext = [
2207026470,2471869646,2768494003,3100713283,3472798876,3889534741,4356278909,4879032378,5464516263,6120258214,
7956335678,8831532602,9803001188,10881331318,12078277762,15701761090,17114919588,18655262350,20334235961,22164317197,
28813612356,30830565220,32988704785,35297914119,37768768107,49099398539,52536356436,56213901386,60148874483,64359295696,
83667084404,86177096936,88762409844,91425282139,94168040603,122418452783,126091006366,129873736556,133769948652,137783047111,
179117961244,184491500081,190026245083,195727032435,201598843408,262078496430,269940851322,278039076861,286380249166,294971656640,
442457484960,455731209508,469403145793,483485240166,497989797370,512929491291,528317376029,544166897309,560491904228,577306661354,
1731919984062,1749239183902,1766731575741,1784398891498,1802242880412,2342915744535,2366344901980,2390008350999,2413908434508,2438047518853,
5412465491853,5466590146771,5521256048238,5576468608720,5632233294807,11377111255510,12514822381061,13766304619167,15142935081083,16657228589191,
33647601750165,37012361925181,40713598117699,44784957929468,49263453722414,99512176519276,109463394171203,120409733588323,132450706947155,145695777641870,
294305470836577,323736017920234,356109619712257,391720581683482,430892639851830,870403132500696,957443445750765,1053187790325841,1158506569358425,1737759854037637];
            
            // OCID 가져오기
            var requestUrl = MAPLE_OCID_API_URL + "?character_name=" + characterName;
            var response = org.jsoup.Jsoup.connect(requestUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .execute()
                .body();
            var dataOcid = JSON.parse(response);
            
            // 현재 캐릭터 정보
            var currentUrl = MAPLE_INF_API_URL + "?ocid=" + dataOcid.ocid;
            var currentResp = org.jsoup.Jsoup.connect(currentUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .execute()
                .body();
            var currentData = JSON.parse(currentResp);
            
            var currentLevel = Number(currentData.character_level);
            var currentExp = Number(currentData.character_exp);
            
            // 목표 레벨 검증
            if (targetLevel < currentLevel || targetLevel > 300) {
                replier.reply("목표 레벨은 현재 레벨(" + currentLevel + ")보다 높고 300 이하여야 합니다.");
                return;
            }
            
            if (targetLevel - currentLevel > 15) {
                replier.reply("최대 15레벨까지만 예측 가능합니다.\n현재 레벨: " + currentLevel + "\n요청 레벨: " + targetLevel);
                return;
            }
            
            // 2주일(14일) 전 날짜 계산
            var twoWeeksAgo = new Date(today.getTime() - 86400000 * 14);
            var twoWeeksAgoStr = 
                twoWeeksAgo.getFullYear() + "-" +
                pad(twoWeeksAgo.getMonth() + 1) + "-" +
                pad(twoWeeksAgo.getDate());
            
            // 2주일 전 데이터 가져오기
            var twoWeeksUrl = MAPLE_INF_API_URL + "?ocid=" + dataOcid.ocid + "&date=" + twoWeeksAgoStr;
            var twoWeeksResp = org.jsoup.Jsoup.connect(twoWeeksUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .execute()
                .body();
            var twoWeeksData = JSON.parse(twoWeeksResp);
            
            // 2주일 평균 경험치 계산
            var cumExp = [0];
            for (var i = 0; i < expToNext.length; i++) {
                cumExp[i + 1] = cumExp[i] + expToNext[i];
            }
            
            function calcTotalExp(lv, exp) {
                if (lv < 200 || lv > 300) return 0;
                return cumExp[lv - 200] + exp;
            }
            
            var twoWeeksAgoTotalExp = calcTotalExp(Number(twoWeeksData.character_level), Number(twoWeeksData.character_exp));
            var currentTotalExp = calcTotalExp(currentLevel, currentExp);
            var totalGainedExp = currentTotalExp - twoWeeksAgoTotalExp;
            var dailyAvgExp = totalGainedExp / 14; // 2주일(14일) 평균
            
            if (dailyAvgExp <= 0) {
                replier.reply("최근 2주간 경험치 획득이 없습니다.");
                return;
            }
            
            // 결과 메시지 생성
            var result = "🎯 [" + decodeURIComponent(characterName) + "] 목표: Lv." + targetLevel + "\n";
            result += "현재: Lv." + currentLevel + " (" + currentData.character_exp_rate + "%)\n";
            result += "2주 평균: " + formatExpValue(dailyAvgExp) + "/일\n\n";
            
            // 각 레벨별 예상 날짜 계산
            var accumulatedDays = 0;
            var currentLvForCalc = currentLevel;
            var currentExpForCalc = currentExp;
            
            for (var lv = currentLevel; lv < targetLevel; lv++) {
                // 현재 레벨에서 다음 레벨까지 남은 경험치
                var expNeeded = expToNext[lv - 200] - currentExpForCalc;
                var daysNeeded = expNeeded / dailyAvgExp;
                accumulatedDays += daysNeeded;
                
                // 예상 날짜 계산
                var levelUpDate = new Date(today.getTime() + accumulatedDays * 86400000);
                var dateStr = 
                    levelUpDate.getFullYear() + "년 " +
                    pad(levelUpDate.getMonth() + 1) + "월 " +
                    pad(levelUpDate.getDate()) + "일";
                
                result += (lv) + "→" + (lv + 1) + "  " + dateStr + "\n";
                
                // 다음 레벨은 0%부터 시작
                currentExpForCalc = 0;
            }
            
            // 최종 도달 날짜
            var finalDate = new Date(today.getTime() + accumulatedDays * 86400000);
            var finalDateStr = 
                finalDate.getFullYear() + "년 " +
                pad(finalDate.getMonth() + 1) + "월 " +
                pad(finalDate.getDate()) + "일";
            
            result += "\n📅 최종 도달 예상일: " + finalDateStr;
            result += "\n⏱️ 예상 소요 기간: " + Math.ceil(accumulatedDays) + "일";
            
            replier.reply(result);
            
        } catch (error) {
            java.lang.System.out.println("[BOT ERROR] 레벨업 예측: " + error.message);
            replier.reply("레벨업 예측 중 오류가 발생했습니다: " + error.message);
        }
    });
    
    thread.start();
}

// 경험치 값 포맷팅 함수
function formatExpValue(exp) {
    if (exp >= 1000000000000) {
        return (exp / 1000000000000).toFixed(1) + "조";
    } else if (exp >= 100000000) {
        return (exp / 100000000).toFixed(1) + "억";
    } else if (exp >= 10000) {
        return (exp / 10000).toFixed(1) + "만";
    } else {
        return Math.floor(exp).toString();
    }
}

// 전투력 랭킹 함수
function getPowerRanking(replier, characterList) {
    replier.reply("🏆 전투력 랭킹 집계 중...\n잠시만 기다려주세요 (" + characterList.length + "명)");
    
    var thread = new java.lang.Thread(function() {
        try {
            function pad(num) {
                return num < 10 ? "0" + num : "" + num;
            }
            
            var baseDate = new Date();
            if (baseDate.getHours() >= 0 && baseDate.getHours() < 6) {
                baseDate.setDate(baseDate.getDate() - 1);
                baseDate.setHours(23, 50, 0, 0);
            }
            
            var today = new Date(baseDate);
            
            // 일주일치 날짜 생성 (2~8일 전)
            var dates = [];
            for (var i = 2; i <= 8; i++) {
                var date = new Date(today.getTime() - 86400000 * i);
                dates.push(
                    date.getFullYear() + "-" +
                    pad(date.getMonth() + 1) + "-" +
                    pad(date.getDate())
                );
            }
            
            var rankingData = [];
            var progressInterval = Math.max(1, Math.floor(characterList.length / 3));
            
            for (var idx = 0; idx < characterList.length; idx++) {
                try {
                    var targetCharName = characterList[idx];
                    var encodedCharName = encodeURIComponent(targetCharName);
                    
                    // OCID 가져오기
                    var ocidUrl = MAPLE_OCID_API_URL + "?character_name=" + encodedCharName;
                    var ocidResp = org.jsoup.Jsoup.connect(ocidUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var ocidJson = JSON.parse(ocidResp);
                    var characterOcid = ocidJson.ocid;
                    
                    // 일주일치 전투력 데이터 수집
                    var maxPower = 0;
                    
                    for (var d = 0; d < dates.length; d++) {
                        try {
                            var statUrl = MAPLE_INF_STAT_URL + "?ocid=" + characterOcid + "&date=" + dates[d];
                            var statResp = org.jsoup.Jsoup.connect(statUrl)
                                .header("accept", "application/json")
                                .header("x-nxopen-api-key", NEXON_API_KEY)
                                .ignoreContentType(true)
                                .timeout(10000)
                                .execute()
                                .body();
                            var statJson = JSON.parse(statResp);
                            
                            // 전투력 찾기
                            for (var s = 0; s < statJson.final_stat.length; s++) {
                                if (statJson.final_stat[s].stat_name === "전투력") {
                                    var power = Number(statJson.final_stat[s].stat_value);
                                    if (power > maxPower) {
                                        maxPower = power;
                                    }
                                    break;
                                }
                            }
                        } catch (e) {
                            // 해당 날짜 데이터 없으면 스킵
                        }
                    }
                    
                    if (maxPower > 0) {
                        rankingData.push({
                            name: targetCharName,
                            power: maxPower
                        });
                    }
                    
                    // 진행 상황 알림
                    if ((idx + 1) % progressInterval === 0) {
                        replier.reply("진행중... " + (idx + 1) + "/" + characterList.length);
                    }
                    
                } catch (err) {
                    continue;
                }
            }
            
            // 전투력 내림차순 정렬
            rankingData.sort(function(a, b) {
                return b.power - a.power;
            });
            
            // 결과 출력 (최대 15위까지)
            var result = "⚔️ 전투력 랭킹 ⚔️\n\n";
            var displayCount = Math.min(30, rankingData.length);
            
            for (var j = 0; j < displayCount; j++) {
                var item = rankingData[j];
                var powerText = formatNumber(item.power);
                
                var medal = "";
                if (j === 0) medal = "🥇";
                else if (j === 1) medal = "🥈";
                else if (j === 2) medal = "🥉";
                else medal = (j + 1) + "위";
                
                result += medal + " " + item.name + "\n    " + powerText + "\n";
            }
            
            replier.reply(result);
            
        } catch (error) {
            java.lang.System.out.println("[BOT ERROR] 전투력 랭킹: " + error.message);
            replier.reply("전투력 랭킹 집계 중 오류가 발생했습니다: " + error.message);
        }
    });
    
    thread.start();
}
// 월별 경험치 히스토리 함수
function getMonthlyExpHistory(characterName, replier) {
    //replier.reply("📊 월별 경험치 집계 중...\n잠시만 기다려주세요");
    
    var thread = new java.lang.Thread(function() {
        try {
            function pad(num) {
                return num < 10 ? "0" + num : "" + num;
            }
            
            var baseDate = new Date();
            if (baseDate.getHours() >= 0 && baseDate.getHours() < 6) {
                baseDate.setDate(baseDate.getDate() - 1);
                baseDate.setHours(23, 50, 0, 0);
            }
            
            var today = new Date(baseDate);
            var currentYear = today.getFullYear();
            var currentMonth = today.getMonth() + 1; // 1~12
            
            // OCID 가져오기
            var requestUrl = MAPLE_OCID_API_URL + "?character_name=" + characterName;
            var response = org.jsoup.Jsoup.connect(requestUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .execute()
                .body();
            var dataOcid = JSON.parse(response);
            
            var expToNext = [
2207026470,2471869646,2768494003,3100713283,3472798876,3889534741,4356278909,4879032378,5464516263,6120258214,
7956335678,8831532602,9803001188,10881331318,12078277762,15701761090,17114919588,18655262350,20334235961,22164317197,
28813612356,30830565220,32988704785,35297914119,37768768107,49099398539,52536356436,56213901386,60148874483,64359295696,
83667084404,86177096936,88762409844,91425282139,94168040603,122418452783,126091006366,129873736556,133769948652,137783047111,
179117961244,184491500081,190026245083,195727032435,201598843408,262078496430,269940851322,278039076861,286380249166,294971656640,
442457484960,455731209508,469403145793,483485240166,497989797370,512929491291,528317376029,544166897309,560491904228,577306661354,
1731919984062,1749239183902,1766731575741,1784398891498,1802242880412,2342915744535,2366344901980,2390008350999,2413908434508,2438047518853,
5412465491853,5466590146771,5521256048238,5576468608720,5632233294807,11377111255510,12514822381061,13766304619167,15142935081083,16657228589191,
33647601750165,37012361925181,40713598117699,44784957929468,49263453722414,99512176519276,109463394171203,120409733588323,132450706947155,145695777641870,
294305470836577,323736017920234,356109619712257,391720581683482,430892639851830,870403132500696,957443445750765,1053187790325841,1158506569358425,1737759854037637];
            
            var cumExp = [0];
            for (var i = 0; i < expToNext.length; i++) {
                cumExp[i + 1] = cumExp[i] + expToNext[i];
            }
            
            function calcGainedExp(prevLv, prevExp, currLv, currExp) {
                if (prevLv < 200 || prevLv > 300 || currLv < 200 || currLv > 300 ||
                    (currLv < prevLv || (currLv === prevLv && currExp < prevExp))) {
                    return 0;
                }
                var prevTotalExp = cumExp[prevLv - 200] + (prevExp || 0);
                var currTotalExp = cumExp[currLv - 200] + (currExp || 0);
                return Math.max(0, currTotalExp - prevTotalExp);
            }
            
            // 현재 데이터 가져오기
            var currentUrl = MAPLE_INF_API_URL + "?ocid=" + dataOcid.ocid;
            var currentResp = org.jsoup.Jsoup.connect(currentUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .timeout(10000)
                .execute()
                .body();
            var currentData = JSON.parse(currentResp);
            
            // 7개월치 데이터 (6개월 전 ~ 현재 월)
            var monthsData = [];
            
            for (var i = 6; i >= 0; i--) {
                var targetYear = currentYear;
                var targetMonth = currentMonth - i;
                
                // 월이 0 이하면 전년도로
                while (targetMonth <= 0) {
                    targetMonth += 12;
                    targetYear -= 1;
                }
                
                // 해당 월의 1일 0시 데이터 = 전달 마지막날
                var prevYear = targetYear;
                var prevMonth = targetMonth - 1;
                if (prevMonth <= 0) {
                    prevMonth = 12;
                    prevYear -= 1;
                }
                
                // 전달 마지막날 계산
                var lastDayOfPrevMonth = new Date(targetYear, targetMonth - 1, 0).getDate();
                
                var dateStr = prevYear + "-" + pad(prevMonth) + "-" + pad(lastDayOfPrevMonth);
                var monthText = targetYear + "년 " + pad(targetMonth) + "월";
                
                monthsData.push({
                    year: targetYear,
                    month: targetMonth,
                    monthText: monthText,
                    dateStr: dateStr,
                    data: null
                });
            }
            
            // 각 월 시작 데이터 가져오기
            for (var i = 0; i < monthsData.length; i++) {
                try {
                    var monthUrl = MAPLE_INF_API_URL + "?ocid=" + dataOcid.ocid + "&date=" + monthsData[i].dateStr;
                    var monthResp = org.jsoup.Jsoup.connect(monthUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    monthsData[i].data = JSON.parse(monthResp);
                } catch (e) {
                    // 데이터 없음
                }
            }
            
            // 각 월의 경험치 계산
            var result = "📊 [" + decodeURIComponent(characterName) + "] 월별 경험치\n\n";
            
            for (var i = 0; i < monthsData.length; i++) {
                if (monthsData[i].data === null) continue;
                
                var startData = monthsData[i].data;
                var endData = null;
                
                // 다음 월 시작 데이터 또는 현재 데이터
                if (i === monthsData.length - 1) {
                    endData = currentData;
                } else {
                    // 다음 유효한 데이터 찾기
                    for (var j = i + 1; j < monthsData.length; j++) {
                        if (monthsData[j].data !== null) {
                            endData = monthsData[j].data;
                            break;
                        }
                    }
                    if (endData === null) {
                        endData = currentData;
                    }
                }
                
                if (endData) {
                    var monthExp = calcGainedExp(
                        Number(startData.character_level),
                        Number(startData.character_exp),
                        Number(endData.character_level),
                        Number(endData.character_exp)
                    );
                    
                    var expText = "";
                    if (monthExp >= 1000000000000) {
                        expText = (monthExp / 1000000000000).toFixed(1) + "조";
                    } else if (monthExp >= 100000000) {
                        expText = (monthExp / 100000000).toFixed(1) + "억";
                    } else if (monthExp >= 10000) {
                        expText = (monthExp / 10000).toFixed(1) + "만";
                    } else {
                        expText = monthExp.toString();
                    }
                    
                    result += monthsData[i].monthText + ": " + expText + " (Lv." + endData.character_level + ")\n";
                }
            }
            
            replier.reply(result);
            
        } catch (error) {
            java.lang.System.out.println("[BOT ERROR] 월별 경험치: " + error.message);
            replier.reply("월별 경험치 집계 중 오류가 발생했습니다: " + error.message);
        }
    });
    
    thread.start();
}

// 이번 달 경험치 랭킹 함수
function getMonthlyRanking(replier) {
    // 즉시 응답
    replier.reply("🏆 이번 달 경험치 랭킹 집계 중...\n잠시만 기다려주세요 (" + RANKING_CHARACTERS.length + "명)");
    
    // 백그라운드 스레드로 실행
    var thread = new java.lang.Thread(function() {
        try {
            // padStart 대체 함수
            function pad(num) {
                return num < 10 ? "0" + num : "" + num;
            }
            
            var baseDate = new Date();
            if (baseDate.getHours() >= 0 && baseDate.getHours() < 6) {
                baseDate.setDate(baseDate.getDate() - 1);
                baseDate.setHours(23, 50, 0, 0);
            }
            
            var today = new Date(baseDate);
            
            // 이번 달 1일 0시 데이터를 가져오기 위해 전달 마지막날 날짜 계산
            var prevMonthLast = new Date(today.getTime());
            prevMonthLast.setDate(1);
            prevMonthLast.setDate(prevMonthLast.getDate() - 1);
            
            var day_first =
                prevMonthLast.getFullYear() + "-" +
                pad(prevMonthLast.getMonth() + 1) + "-" +
                pad(prevMonthLast.getDate());
            
            var expToNext = [
2207026470,2471869646,2768494003,3100713283,3472798876,3889534741,4356278909,4879032378,5464516263,6120258214,
7956335678,8831532602,9803001188,10881331318,12078277762,15701761090,17114919588,18655262350,20334235961,22164317197,
28813612356,30830565220,32988704785,35297914119,37768768107,49099398539,52536356436,56213901386,60148874483,64359295696,
83667084404,86177096936,88762409844,91425282139,94168040603,122418452783,126091006366,129873736556,133769948652,137783047111,
179117961244,184491500081,190026245083,195727032435,201598843408,262078496430,269940851322,278039076861,286380249166,294971656640,
442457484960,455731209508,469403145793,483485240166,497989797370,512929491291,528317376029,544166897309,560491904228,577306661354,
1731919984062,1749239183902,1766731575741,1784398891498,1802242880412,2342915744535,2366344901980,2390008350999,2413908434508,2438047518853,
5412465491853,5466590146771,5521256048238,5576468608720,5632233294807,11377111255510,12514822381061,13766304619167,15142935081083,16657228589191,
33647601750165,37012361925181,40713598117699,44784957929468,49263453722414,99512176519276,109463394171203,120409733588323,132450706947155,145695777641870,
294305470836577,323736017920234,356109619712257,391720581683482,430892639851830,870403132500696,957443445750765,1053187790325841,1158506569358425,1737759854037637];
            
            var cumExp = [0];
            for (var i = 0; i < expToNext.length; i++) {
                cumExp[i + 1] = cumExp[i] + expToNext[i];
            }
            
            function calcGainedExp(prevLv, prevExp, currLv, currExp) {
                if (prevLv < 200 || prevLv > 300 || currLv < 200 || currLv > 300 ||
                    (currLv < prevLv || (currLv === prevLv && currExp < prevExp))) {
                    return 0;
                }
                var prevTotalExp = cumExp[prevLv - 200] + (prevExp || 0);
                var currTotalExp = cumExp[currLv - 200] + (currExp || 0);
                return Math.max(0, currTotalExp - prevTotalExp);
            }
            
            // 각 캐릭터의 이번 달 경험치 수집
            var rankingData = [];
            
            // 진행 상황 알림 (10명마다)
            var progressInterval = Math.max(1, Math.floor(RANKING_CHARACTERS.length / 3));
            
            for (var idx = 0; idx < RANKING_CHARACTERS.length; idx++) {
                try {
                    var targetCharName = RANKING_CHARACTERS[idx];
                    var encodedCharName = encodeURIComponent(targetCharName);
                    
                    // OCID 가져오기
                    var ocidUrl = MAPLE_OCID_API_URL + "?character_name=" + encodedCharName;
                    var ocidResp = org.jsoup.Jsoup.connect(ocidUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var ocidJson = JSON.parse(ocidResp);
                    var characterOcid = ocidJson.ocid;
                    
                    // 현재 데이터
                    var currentUrl = MAPLE_INF_API_URL + "?ocid=" + characterOcid;
                    var currentResp = org.jsoup.Jsoup.connect(currentUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var currentJson = JSON.parse(currentResp);
                    
                    // 이번 달 1일 0시 데이터
                    var firstUrl = MAPLE_INF_API_URL + "?ocid=" + characterOcid + "&date=" + day_first;
                    var firstResp = org.jsoup.Jsoup.connect(firstUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var firstJson = JSON.parse(firstResp);
                    
                    // 이번 달 경험치 계산
                    var monthExp = calcGainedExp(
                        Number(firstJson.character_level),
                        Number(firstJson.character_exp),
                        Number(currentJson.character_level),
                        Number(currentJson.character_exp)
                    );
                    
                    rankingData.push({
                        name: currentJson.character_name,
                        exp: monthExp,
                        level: currentJson.character_level
                    });
                    
                    // 진행 상황 알림
                    if ((idx + 1) % progressInterval === 0) {
                        replier.reply("진행중... " + (idx + 1) + "/" + RANKING_CHARACTERS.length);
                    }
                    
                } catch (err) {
                    // 실패한 캐릭터는 조용히 스킵
                    continue;
                }
            }
            
            // 경험치 내림차순 정렬
            rankingData.sort(function(a, b) {
                return b.exp - a.exp;
            });
            
            // 결과 출력 (최대 15위까지)
            var result = "🏆 이번 달 경험치 랭킹 🏆\n\n";
            
            var displayCount = Math.min(50, rankingData.length);
            
            for (var j = 0; j < displayCount; j++) {
                var item = rankingData[j];
                var expText = "";
                var expVal = item.exp;
                
                if (expVal >= 1000000000000) {
                    expText = (expVal / 1000000000000).toFixed(1) + "조";
                } else if (expVal >= 100000000) {
                    expText = (expVal / 100000000).toFixed(1) + "억";
                } else if (expVal >= 10000) {
                    expText = (expVal / 10000).toFixed(1) + "만";
                } else {
                    expText = expVal.toString();
                }
                
                var medal = "";
                if (j === 0) medal = "🥇";
                else if (j === 1) medal = "🥈";
                else if (j === 2) medal = "🥉";
                else medal = (j + 1) + "위";
                
                result += medal + " " + item.name + " (Lv." + item.level + ")\n    " + expText + "\n";
            }
            
            replier.reply(result);
            
        } catch (error) {
            java.lang.System.out.println("[BOT ERROR] 랭킹 집계: " + error.message);
            replier.reply("랭킹 집계 중 오류가 발생했습니다.");
        }
    });
    
    thread.start();
}
function getMonthlyRanking3(replier) {
    // 즉시 응답
    replier.reply("🏆 이번 달 경험치 랭킹 집계 중...\n잠시만 기다려주세요 (" + RANKING_CHARACTERS3.length + "명)");
    
    // 백그라운드 스레드로 실행
    var thread = new java.lang.Thread(function() {
        try {
            // padStart 대체 함수
            function pad(num) {
                return num < 10 ? "0" + num : "" + num;
            }
            
            var baseDate = new Date();
            if (baseDate.getHours() >= 0 && baseDate.getHours() < 6) {
                baseDate.setDate(baseDate.getDate() - 1);
                baseDate.setHours(23, 50, 0, 0);
            }
            
            var today = new Date(baseDate);
            
            // 이번 달 1일 0시 데이터를 가져오기 위해 전달 마지막날 날짜 계산
            var prevMonthLast = new Date(today.getTime());
            prevMonthLast.setDate(1);
            prevMonthLast.setDate(prevMonthLast.getDate() - 1);
            
            var day_first =
                prevMonthLast.getFullYear() + "-" +
                pad(prevMonthLast.getMonth() + 1) + "-" +
                pad(prevMonthLast.getDate());
            
            var expToNext = [
2207026470,2471869646,2768494003,3100713283,3472798876,3889534741,4356278909,4879032378,5464516263,6120258214,
7956335678,8831532602,9803001188,10881331318,12078277762,15701761090,17114919588,18655262350,20334235961,22164317197,
28813612356,30830565220,32988704785,35297914119,37768768107,49099398539,52536356436,56213901386,60148874483,64359295696,
83667084404,86177096936,88762409844,91425282139,94168040603,122418452783,126091006366,129873736556,133769948652,137783047111,
179117961244,184491500081,190026245083,195727032435,201598843408,262078496430,269940851322,278039076861,286380249166,294971656640,
442457484960,455731209508,469403145793,483485240166,497989797370,512929491291,528317376029,544166897309,560491904228,577306661354,
1731919984062,1749239183902,1766731575741,1784398891498,1802242880412,2342915744535,2366344901980,2390008350999,2413908434508,2438047518853,
5412465491853,5466590146771,5521256048238,5576468608720,5632233294807,11377111255510,12514822381061,13766304619167,15142935081083,16657228589191,
33647601750165,37012361925181,40713598117699,44784957929468,49263453722414,99512176519276,109463394171203,120409733588323,132450706947155,145695777641870,
294305470836577,323736017920234,356109619712257,391720581683482,430892639851830,870403132500696,957443445750765,1053187790325841,1158506569358425,1737759854037637];
            
            var cumExp = [0];
            for (var i = 0; i < expToNext.length; i++) {
                cumExp[i + 1] = cumExp[i] + expToNext[i];
            }
            
            function calcGainedExp(prevLv, prevExp, currLv, currExp) {
                if (prevLv < 200 || prevLv > 300 || currLv < 200 || currLv > 300 ||
                    (currLv < prevLv || (currLv === prevLv && currExp < prevExp))) {
                    return 0;
                }
                var prevTotalExp = cumExp[prevLv - 200] + (prevExp || 0);
                var currTotalExp = cumExp[currLv - 200] + (currExp || 0);
                return Math.max(0, currTotalExp - prevTotalExp);
            }
            
            // 각 캐릭터의 이번 달 경험치 수집
            var rankingData = [];
            
            // 진행 상황 알림 (10명마다)
            var progressInterval = Math.max(1, Math.floor(RANKING_CHARACTERS.length / 3));
            
            for (var idx = 0; idx < RANKING_CHARACTERS3.length; idx++) {
                try {
                    var targetCharName = RANKING_CHARACTERS3[idx];
                    var encodedCharName = encodeURIComponent(targetCharName);
                    
                    // OCID 가져오기
                    var ocidUrl = MAPLE_OCID_API_URL + "?character_name=" + encodedCharName;
                    var ocidResp = org.jsoup.Jsoup.connect(ocidUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var ocidJson = JSON.parse(ocidResp);
                    var characterOcid = ocidJson.ocid;
                    
                    // 현재 데이터
                    var currentUrl = MAPLE_INF_API_URL + "?ocid=" + characterOcid;
                    var currentResp = org.jsoup.Jsoup.connect(currentUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var currentJson = JSON.parse(currentResp);
                    
                    // 이번 달 1일 0시 데이터
                    var firstUrl = MAPLE_INF_API_URL + "?ocid=" + characterOcid + "&date=" + day_first;
                    var firstResp = org.jsoup.Jsoup.connect(firstUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var firstJson = JSON.parse(firstResp);
                    
                    // 이번 달 경험치 계산
                    var monthExp = calcGainedExp(
                        Number(firstJson.character_level),
                        Number(firstJson.character_exp),
                        Number(currentJson.character_level),
                        Number(currentJson.character_exp)
                    );
                    
                    rankingData.push({
                        name: currentJson.character_name,
                        exp: monthExp,
                        level: currentJson.character_level
                    });
                    
                    // 진행 상황 알림
                    if ((idx + 1) % progressInterval === 0) {
                        replier.reply("진행중... " + (idx + 1) + "/" + RANKING_CHARACTERS3.length);
                    }
                    
                } catch (err) {
                    // 실패한 캐릭터는 조용히 스킵
                    continue;
                }
            }
            
            // 경험치 내림차순 정렬
            rankingData.sort(function(a, b) {
                return b.exp - a.exp;
            });
            
            // 결과 출력 (최대 15위까지)
            var result = "🏆 이번 달 경험치 랭킹 🏆\n\n";
            
            var displayCount = Math.min(15, rankingData.length);
            
            for (var j = 0; j < displayCount; j++) {
                var item = rankingData[j];
                var expText = "";
                var expVal = item.exp;
                
                if (expVal >= 1000000000000) {
                    expText = (expVal / 1000000000000).toFixed(1) + "조";
                } else if (expVal >= 100000000) {
                    expText = (expVal / 100000000).toFixed(1) + "억";
                } else if (expVal >= 10000) {
                    expText = (expVal / 10000).toFixed(1) + "만";
                } else {
                    expText = expVal.toString();
                }
                
                var medal = "";
                if (j === 0) medal = "🥇";
                else if (j === 1) medal = "🥈";
                else if (j === 2) medal = "🥉";
                else medal = (j + 1) + "위";
                
                result += medal + " " + item.name + " (Lv." + item.level + ")\n    " + expText + "\n";
            }
            
            replier.reply(result);
            
        } catch (error) {
            java.lang.System.out.println("[BOT ERROR] 랭킹 집계: " + error.message);
            replier.reply("랭킹 집계 중 오류가 발생했습니다.");
        }
    });
    
    thread.start();
}
function getMonthlyRanking4(replier) {
    // 즉시 응답
    replier.reply("🏆 이번 달 경험치 랭킹 집계 중...\n잠시만 기다려주세요 (" + RANKING_CHARACTERS4.length + "명)");
    
    // 백그라운드 스레드로 실행
    var thread = new java.lang.Thread(function() {
        try {
            // padStart 대체 함수
            function pad(num) {
                return num < 10 ? "0" + num : "" + num;
            }
            
            var baseDate = new Date();
            if (baseDate.getHours() >= 0 && baseDate.getHours() < 6) {
                baseDate.setDate(baseDate.getDate() - 1);
                baseDate.setHours(23, 50, 0, 0);
            }
            
            var today = new Date(baseDate);
            
            // 이번 달 1일 0시 데이터를 가져오기 위해 전달 마지막날 날짜 계산
            var prevMonthLast = new Date(today.getTime());
            prevMonthLast.setDate(1);
            prevMonthLast.setDate(prevMonthLast.getDate() - 1);
            
            var day_first =
                prevMonthLast.getFullYear() + "-" +
                pad(prevMonthLast.getMonth() + 1) + "-" +
                pad(prevMonthLast.getDate());
            
            var expToNext = [
2207026470,2471869646,2768494003,3100713283,3472798876,3889534741,4356278909,4879032378,5464516263,6120258214,
7956335678,8831532602,9803001188,10881331318,12078277762,15701761090,17114919588,18655262350,20334235961,22164317197,
28813612356,30830565220,32988704785,35297914119,37768768107,49099398539,52536356436,56213901386,60148874483,64359295696,
83667084404,86177096936,88762409844,91425282139,94168040603,122418452783,126091006366,129873736556,133769948652,137783047111,
179117961244,184491500081,190026245083,195727032435,201598843408,262078496430,269940851322,278039076861,286380249166,294971656640,
442457484960,455731209508,469403145793,483485240166,497989797370,512929491291,528317376029,544166897309,560491904228,577306661354,
1731919984062,1749239183902,1766731575741,1784398891498,1802242880412,2342915744535,2366344901980,2390008350999,2413908434508,2438047518853,
5412465491853,5466590146771,5521256048238,5576468608720,5632233294807,11377111255510,12514822381061,13766304619167,15142935081083,16657228589191,
33647601750165,37012361925181,40713598117699,44784957929468,49263453722414,99512176519276,109463394171203,120409733588323,132450706947155,145695777641870,
294305470836577,323736017920234,356109619712257,391720581683482,430892639851830,870403132500696,957443445750765,1053187790325841,1158506569358425,1737759854037637];
            
            var cumExp = [0];
            for (var i = 0; i < expToNext.length; i++) {
                cumExp[i + 1] = cumExp[i] + expToNext[i];
            }
            
            function calcGainedExp(prevLv, prevExp, currLv, currExp) {
                if (prevLv < 200 || prevLv > 300 || currLv < 200 || currLv > 300 ||
                    (currLv < prevLv || (currLv === prevLv && currExp < prevExp))) {
                    return 0;
                }
                var prevTotalExp = cumExp[prevLv - 200] + (prevExp || 0);
                var currTotalExp = cumExp[currLv - 200] + (currExp || 0);
                return Math.max(0, currTotalExp - prevTotalExp);
            }
            
            // 각 캐릭터의 이번 달 경험치 수집
            var rankingData = [];
            
            // 진행 상황 알림 (10명마다)
            var progressInterval = Math.max(1, Math.floor(RANKING_CHARACTERS.length / 3));
            
            for (var idx = 0; idx < RANKING_CHARACTERS4.length; idx++) {
                try {
                    var targetCharName = RANKING_CHARACTERS4[idx];
                    var encodedCharName = encodeURIComponent(targetCharName);
                    
                    // OCID 가져오기
                    var ocidUrl = MAPLE_OCID_API_URL + "?character_name=" + encodedCharName;
                    var ocidResp = org.jsoup.Jsoup.connect(ocidUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var ocidJson = JSON.parse(ocidResp);
                    var characterOcid = ocidJson.ocid;
                    
                    // 현재 데이터
                    var currentUrl = MAPLE_INF_API_URL + "?ocid=" + characterOcid;
                    var currentResp = org.jsoup.Jsoup.connect(currentUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var currentJson = JSON.parse(currentResp);
                    
                    // 이번 달 1일 0시 데이터
                    var firstUrl = MAPLE_INF_API_URL + "?ocid=" + characterOcid + "&date=" + day_first;
                    var firstResp = org.jsoup.Jsoup.connect(firstUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var firstJson = JSON.parse(firstResp);
                    
                    // 이번 달 경험치 계산
                    var monthExp = calcGainedExp(
                        Number(firstJson.character_level),
                        Number(firstJson.character_exp),
                        Number(currentJson.character_level),
                        Number(currentJson.character_exp)
                    );
                    
                    rankingData.push({
                        name: currentJson.character_name,
                        exp: monthExp,
                        level: currentJson.character_level
                    });
                    
                    // 진행 상황 알림
                    if ((idx + 1) % progressInterval === 0) {
                        replier.reply("진행중... " + (idx + 1) + "/" + RANKING_CHARACTERS4.length);
                    }
                    
                } catch (err) {
                    // 실패한 캐릭터는 조용히 스킵
                    continue;
                }
            }
            
            // 경험치 내림차순 정렬
            rankingData.sort(function(a, b) {
                return b.exp - a.exp;
            });
            
            // 결과 출력 (최대 15위까지)
            var result = "🏆 이번 달 경험치 랭킹 🏆\n\n";
            
            var displayCount = Math.min(50, rankingData.length);
            
            for (var j = 0; j < displayCount; j++) {
                var item = rankingData[j];
                var expText = "";
                var expVal = item.exp;
                
                if (expVal >= 1000000000000) {
                    expText = (expVal / 1000000000000).toFixed(1) + "조";
                } else if (expVal >= 100000000) {
                    expText = (expVal / 100000000).toFixed(1) + "억";
                } else if (expVal >= 10000) {
                    expText = (expVal / 10000).toFixed(1) + "만";
                } else {
                    expText = expVal.toString();
                }
                
                var medal = "";
                if (j === 0) medal = "🥇";
                else if (j === 1) medal = "🥈";
                else if (j === 2) medal = "🥉";
                else medal = (j + 1) + "위";
                
                result += medal + " " + item.name + " (Lv." + item.level + ")\n    " + expText + "\n";
            }
            
            replier.reply(result);
            
        } catch (error) {
            java.lang.System.out.println("[BOT ERROR] 랭킹 집계: " + error.message);
            replier.reply("랭킹 집계 중 오류가 발생했습니다.");
        }
    });
    
    thread.start();
}

// 이번 달 경험치 랭킹 함수
function getMonthlyRanking2(replier) {
    // 즉시 응답
    replier.reply("🏆 이번 달 경험치 랭킹 집계 중...\n잠시만 기다려주세요 (" + RANKING_CHARACTERS.length + "명)");
    
    // 백그라운드 스레드로 실행
    var thread = new java.lang.Thread(function() {
        try {
            // padStart 대체 함수
            function pad(num) {
                return num < 10 ? "0" + num : "" + num;
            }
            
            var baseDate = new Date();
            if (baseDate.getHours() >= 0 && baseDate.getHours() < 6) {
                baseDate.setDate(baseDate.getDate() - 1);
                baseDate.setHours(23, 50, 0, 0);
            }
            
            var today = new Date(baseDate);
            
            // 이번 달 1일 0시 데이터를 가져오기 위해 전달 마지막날 날짜 계산
            var prevMonthLast = new Date(today.getTime());
            prevMonthLast.setDate(1);
            prevMonthLast.setDate(prevMonthLast.getDate() - 1);
            
            var day_first =
                prevMonthLast.getFullYear() + "-" +
                pad(prevMonthLast.getMonth() + 1) + "-" +
                pad(prevMonthLast.getDate());
            
            var expToNext = [
2207026470,2471869646,2768494003,3100713283,3472798876,3889534741,4356278909,4879032378,5464516263,6120258214,
7956335678,8831532602,9803001188,10881331318,12078277762,15701761090,17114919588,18655262350,20334235961,22164317197,
28813612356,30830565220,32988704785,35297914119,37768768107,49099398539,52536356436,56213901386,60148874483,64359295696,
83667084404,86177096936,88762409844,91425282139,94168040603,122418452783,126091006366,129873736556,133769948652,137783047111,
179117961244,184491500081,190026245083,195727032435,201598843408,262078496430,269940851322,278039076861,286380249166,294971656640,
442457484960,455731209508,469403145793,483485240166,497989797370,512929491291,528317376029,544166897309,560491904228,577306661354,
1731919984062,1749239183902,1766731575741,1784398891498,1802242880412,2342915744535,2366344901980,2390008350999,2413908434508,2438047518853,
5412465491853,5466590146771,5521256048238,5576468608720,5632233294807,11377111255510,12514822381061,13766304619167,15142935081083,16657228589191,
33647601750165,37012361925181,40713598117699,44784957929468,49263453722414,99512176519276,109463394171203,120409733588323,132450706947155,145695777641870,
294305470836577,323736017920234,356109619712257,391720581683482,430892639851830,870403132500696,957443445750765,1053187790325841,1158506569358425,1737759854037637];
            
            var cumExp = [0];
            for (var i = 0; i < expToNext.length; i++) {
                cumExp[i + 1] = cumExp[i] + expToNext[i];
            }
            
            function calcGainedExp(prevLv, prevExp, currLv, currExp) {
                if (prevLv < 200 || prevLv > 300 || currLv < 200 || currLv > 300 ||
                    (currLv < prevLv || (currLv === prevLv && currExp < prevExp))) {
                    return 0;
                }
                var prevTotalExp = cumExp[prevLv - 200] + (prevExp || 0);
                var currTotalExp = cumExp[currLv - 200] + (currExp || 0);
                return Math.max(0, currTotalExp - prevTotalExp);
            }
            
            // 각 캐릭터의 이번 달 경험치 수집
            var rankingData = [];
            
            // 진행 상황 알림 (10명마다)
            var progressInterval = Math.max(1, Math.floor(RANKING_CHARACTERS.length / 3));
            
            for (var idx = 0; idx < RANKING_CHARACTERS2.length; idx++) {
                try {
                    var targetCharName = RANKING_CHARACTERS2[idx];
                    var encodedCharName = encodeURIComponent(targetCharName);
                    
                    // OCID 가져오기
                    var ocidUrl = MAPLE_OCID_API_URL + "?character_name=" + encodedCharName;
                    var ocidResp = org.jsoup.Jsoup.connect(ocidUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var ocidJson = JSON.parse(ocidResp);
                    var characterOcid = ocidJson.ocid;
                    
                    // 현재 데이터
                    var currentUrl = MAPLE_INF_API_URL + "?ocid=" + characterOcid;
                    var currentResp = org.jsoup.Jsoup.connect(currentUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var currentJson = JSON.parse(currentResp);
                    
                    // 이번 달 1일 0시 데이터
                    var firstUrl = MAPLE_INF_API_URL + "?ocid=" + characterOcid + "&date=" + day_first;
                    var firstResp = org.jsoup.Jsoup.connect(firstUrl)
                        .header("accept", "application/json")
                        .header("x-nxopen-api-key", NEXON_API_KEY)
                        .ignoreContentType(true)
                        .timeout(10000)
                        .execute()
                        .body();
                    var firstJson = JSON.parse(firstResp);
                    
                    // 이번 달 경험치 계산
                    var monthExp = calcGainedExp(
                        Number(firstJson.character_level),
                        Number(firstJson.character_exp),
                        Number(currentJson.character_level),
                        Number(currentJson.character_exp)
                    );
                    
                    rankingData.push({
                        name: currentJson.character_name,
                        exp: monthExp,
                        level: currentJson.character_level
                    });
                    
                    // 진행 상황 알림
                    if ((idx + 1) % progressInterval === 0) {
                        replier.reply("진행중... " + (idx + 1) + "/" + RANKING_CHARACTERS.length);
                    }
                    
                } catch (err) {
                    // 실패한 캐릭터는 조용히 스킵
                    continue;
                }
            }
            
            // 경험치 내림차순 정렬
            rankingData.sort(function(a, b) {
                return b.exp - a.exp;
            });
            
            // 결과 출력 (최대 15위까지)
            var result = "🏆 이번 달 경험치 랭킹 🏆\n\n";
            
            var displayCount = Math.min(15, rankingData.length);
            
            for (var j = 0; j < displayCount; j++) {
                var item = rankingData[j];
                var expText = "";
                var expVal = item.exp;
                
                if (expVal >= 1000000000000) {
                    expText = (expVal / 1000000000000).toFixed(1) + "조";
                } else if (expVal >= 100000000) {
                    expText = (expVal / 100000000).toFixed(1) + "억";
                } else if (expVal >= 10000) {
                    expText = (expVal / 10000).toFixed(1) + "만";
                } else {
                    expText = expVal.toString();
                }
                
                var medal = "";
                if (j === 0) medal = "🥇";
                else if (j === 1) medal = "🥈";
                else if (j === 2) medal = "🥉";
                else medal = (j + 1) + "위";
                
                result += medal + " " + item.name + " (Lv." + item.level + ")\n    " + expText + "\n";
            }
            
            replier.reply(result);
            
        } catch (error) {
            java.lang.System.out.println("[BOT ERROR] 랭킹 집계: " + error.message);
            replier.reply("랭킹 집계 중 오류가 발생했습니다.");
        }
    });
    
    thread.start();
}
function getPower(power,replier)
{
    try {
//일주일 시간표기
        var today11 = new Date(Date.now()-86400000*2);
        var day_11=
          today11.getFullYear() + "-" +
          String(today11.getMonth() + 1).padStart(2, "0") + "-" +
          String(today11.getDate()).padStart(2, "0");
          
        var today22 = new Date(Date.now()-86400000*3);
        var day_22=
          today22.getFullYear() + "-" +
          String(today22.getMonth() + 1).padStart(2, "0") + "-" +
          String(today22.getDate()).padStart(2, "0");
          
        var today33 = new Date(Date.now()-86400000*4);
        var day_33=
          today33.getFullYear() + "-" +
          String(today33.getMonth() + 1).padStart(2, "0") + "-" +
          String(today33.getDate()).padStart(2, "0");
          
        var today44 = new Date(Date.now()-86400000*5);
        var day_44=
          today44.getFullYear() + "-" +
          String(today44.getMonth() + 1).padStart(2, "0") + "-" +
          String(today44.getDate()).padStart(2, "0");
          
        var today55 = new Date(Date.now()-86400000*6);
        var day_55=
          today55.getFullYear() + "-" +
          String(today55.getMonth() + 1).padStart(2, "0") + "-" +
          String(today55.getDate()).padStart(2, "0");
          
        var today66 = new Date(Date.now()-86400000*7);
        var day_66=
          today66.getFullYear() + "-" +
          String(today66.getMonth() + 1).padStart(2, "0") + "-" +
          String(today66.getDate()).padStart(2, "0");
          
        var today77 = new Date(Date.now()-86400000*8);
        var day_77=
          today77.getFullYear() + "-" +
          String(today77.getMonth() + 1).padStart(2, "0") + "-" +
          String(today77.getDate()).padStart(2, "0");

//한달전 시간 표기
        var today1 = new Date(Date.now()-86400000*30);
        var day_1=
          today1.getFullYear() + "-" +
          String(today1.getMonth() + 1).padStart(2, "0") + "-" +
          String(today1.getDate()).padStart(2, "0");
          
        var today2 = new Date(Date.now()-86400000*31);
        var day_2=
          today2.getFullYear() + "-" +
          String(today2.getMonth() + 1).padStart(2, "0") + "-" +
          String(today2.getDate()).padStart(2, "0");
          
        var today3 = new Date(Date.now()-86400000*32);
        var day_3=
          today3.getFullYear() + "-" +
          String(today3.getMonth() + 1).padStart(2, "0") + "-" +
          String(today3.getDate()).padStart(2, "0");
          
        var today4 = new Date(Date.now()-86400000*33);
        var day_4=
          today4.getFullYear() + "-" +
          String(today4.getMonth() + 1).padStart(2, "0") + "-" +
          String(today4.getDate()).padStart(2, "0");
          
        var today5 = new Date(Date.now()-86400000*34);
        var day_5=
          today5.getFullYear() + "-" +
          String(today5.getMonth() + 1).padStart(2, "0") + "-" +
          String(today5.getDate()).padStart(2, "0");
          
        var today6 = new Date(Date.now()-86400000*35);
        var day_6=
          today6.getFullYear() + "-" +
          String(today6.getMonth() + 1).padStart(2, "0") + "-" +
          String(today6.getDate()).padStart(2, "0");
          
        var today7 = new Date(Date.now()-86400000*36);
        var day_7=
          today7.getFullYear() + "-" +
          String(today7.getMonth() + 1).padStart(2, "0") + "-" +
          String(today7.getDate()).padStart(2, "0");
            
//---------------------------------------------------------------------
//ocid 값을 들고와 저장
  var requestUrl = MAPLE_OCID_API_URL + "?character_name=" + power;
        var response = org.jsoup.Jsoup.connect(requestUrl)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)            
            .ignoreContentType(true)
            .execute()
            .body();
        var data = JSON.parse(response);
//최신 stat 저장 data2
        var inforUrl = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid;
        var response2 = org.jsoup.Jsoup.connect(inforUrl)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data2 = JSON.parse(response2);
//일주일 stat 저장 data10->data20까지
        var inforUrl10 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_11;
        var response10 = org.jsoup.Jsoup.connect(inforUrl10)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data10 = JSON.parse(response10);
        
        var inforUrl11 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_22;
        var response11 = org.jsoup.Jsoup.connect(inforUrl11)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data11 = JSON.parse(response11);
        
        var inforUrl12 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_33;
        var response12 = org.jsoup.Jsoup.connect(inforUrl12)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data12 = JSON.parse(response12);
        
        var inforUrl13 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_44;
        var response13 = org.jsoup.Jsoup.connect(inforUrl13)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data13 = JSON.parse(response13);
        
        var inforUrl14 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_55;
        var response14 = org.jsoup.Jsoup.connect(inforUrl14)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data14 = JSON.parse(response14);
        
        var inforUrl15 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_66;
        var response15 = org.jsoup.Jsoup.connect(inforUrl15)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data15 = JSON.parse(response15);
        
        var inforUrl16 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_77;
        var response16 = org.jsoup.Jsoup.connect(inforUrl16)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data16 = JSON.parse(response16);
//-----------------------------------------------------------------------------------------

//한달전 stat 저장 data3->data9까지
        var inforUrl2 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_1;
        var response3 = org.jsoup.Jsoup.connect(inforUrl2)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data3 = JSON.parse(response3);
        
        var inforUrl3 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_2;
        var response4 = org.jsoup.Jsoup.connect(inforUrl3)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data4 = JSON.parse(response4);
        
        var inforUrl4 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_3;
        var response5 = org.jsoup.Jsoup.connect(inforUrl4)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data5 = JSON.parse(response5);
        
        var inforUrl5 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_4;
        var response6 = org.jsoup.Jsoup.connect(inforUrl5)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data6 = JSON.parse(response6);
        
        var inforUrl6 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_5;
        var response7 = org.jsoup.Jsoup.connect(inforUrl6)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data7 = JSON.parse(response7);
        
        var inforUrl7 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_6;
        var response8 = org.jsoup.Jsoup.connect(inforUrl7)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data8 = JSON.parse(response8);
        
        var inforUrl8 = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid+"&date="+day_7;
        var response9 = org.jsoup.Jsoup.connect(inforUrl8)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data9 = JSON.parse(response9);
//-----------------------------------------------------------------------------------------
//현재 전투력 (최신)
  var battlePower = null;
    for (var stat of data2.final_stat) {
        if (stat.stat_name === "전투력") {
            battlePower = stat.stat_value;
            break;
        }
    }
//일주일 전투력 일주일치 중 가장 높은 전투력 찾기
    var b1 = null;
    for (var stat of data10.final_stat) {
        if (stat.stat_name === "전투력") {
            b1= stat.stat_value;
            break;
        }
    }
    var b2 = null;
    for (var stat of data11.final_stat) {
        if (stat.stat_name === "전투력") {
            b2= stat.stat_value;
            break;
        }
    }
    var b3 = null;
    for (var stat of data12.final_stat) {
        if (stat.stat_name === "전투력") {
            b3= stat.stat_value;
            break;
        }
    }
    var b4 = null;
    for (var stat of data13.final_stat) {
        if (stat.stat_name === "전투력") {
            b4= stat.stat_value;
            break;
        }
    }
    var b5 = null;
    for (var stat of data14.final_stat) {
        if (stat.stat_name === "전투력") {
            b5= stat.stat_value;
            break;
        }
    }
    var b6 = null;
    for (var stat of data15.final_stat) {
        if (stat.stat_name === "전투력") {
            b6= stat.stat_value;
            break;
        }
    }
    var b7 = null;
    for (var stat of data16.final_stat) {
        if (stat.stat_name === "전투력") {
            b7= stat.stat_value;
            break;
        }
    }
    //일주일 중 가장 높은 전투력 저장
var nowpower = Number(Math.max(b1, b2, b3, b4, b5, b6, b7));
//replier.reply (b1+"\n"+b2+"\n"+b3+"\n"+b4+"\n"+b5+"\n"+b6+"\n"+b7)
//한달전 전투력 일주일치 중 가b1+"\n"+장 높은 전투력 찾기
    var a1 = null;
    for (var stat of data3.final_stat) {
        if (stat.stat_name === "전투력") {
            a1= stat.stat_value;
            break;
        }
    }
    var a2 = null;
    for (var stat of data4.final_stat) {
        if (stat.stat_name === "전투력") {
            a2= stat.stat_value;
            break;
        }
    }
    var a3 = null;
    for (var stat of data5.final_stat) {
        if (stat.stat_name === "전투력") {
            a3= stat.stat_value;
            break;
        }
    }
    var a4 = null;
    for (var stat of data6.final_stat) {
        if (stat.stat_name === "전투력") {
            a4= stat.stat_value;
            break;
        }
    }
    var a5 = null;
    for (var stat of data7.final_stat) {
        if (stat.stat_name === "전투력") {
            a5= stat.stat_value;
            break;
        }
    }
    var a6 = null;
    for (var stat of data8.final_stat) {
        if (stat.stat_name === "전투력") {
            a6= stat.stat_value;
            break;
        }
    }
    var a7 = null;
    for (var stat of data9.final_stat) {
        if (stat.stat_name === "전투력") {
            a7= stat.stat_value;
            break;
        }
    }
    //일주일 중 가장 높은 전투력 저장
    var onepower=a1;
    onepower = Number(Math.max(a1, a2, a3, a4, a5, a6, a7));
    
//자릿수 정리
if(Number(battlePower)>Number(nowpower)){nowpower=battlePower;}

var formatted1 = formatNumber(onepower);
var formatted2 = formatNumber(nowpower);
var formatted3 = formatNumber(battlePower);

var Tag = "???";

if (nowpower < 50000000) Tag = "노멀";
else if (nowpower < 100000000) Tag = "레  어";
else if (nowpower < 200000000) Tag = "에  픽";
else if (nowpower < 300000000) Tag = "유니크";
else if (nowpower < 400000000) Tag = "레전드리";
else if (nowpower < 500000000) Tag = "초  월";
else Tag = "신";
// 전투력 값 출력
    if (nowpower) {
        replier.reply(
        "!전투력! -"+decodeURIComponent(power)+"님-\n\등 급 : "+Tag+
        "\n과 거: " + formatted1+"\n"+
        "최 근: " + formatted2+"\n\n종료전:"+formatted3);
    } else {
        replier.reply("전투력 정보를 가져올 수 없습니다.");
    }
    } catch (error) {
        java.lang.System.out.println("[BOT ERROR] getPower: " + (error.message || error));
        replier.reply("전투력 조회 중 오류: " + error.message);
    }
}
//자리수
function formatNumber(number) {
  var units = ['', '만', '억'];
  var result = '';
  var unitIndex = 0;

  while (number > 0) {
    var chunk = number % 10000;
    if (chunk > 0) {
      result = chunk + units[unitIndex] + result;
    }
    number = Math.floor(number / 10000);
    unitIndex++;
  }
  
  return result;
}
function getImage(characterimage, replier) {
    try {
        var today10 = new Date(Date.now() - 86400000); // 하루 전
        var day_10 =
            today10.getFullYear() + "-" +
            String(today10.getMonth() + 1).padStart(2, "0") + "-" +
            String(today10.getDate()).padStart(2, "0");

        // Step 1: ocid 가져오기
        var requestUrl10 = MAPLE_OCID_API_URL + "?character_name=" + characterimage;
        var response10 = org.jsoup.Jsoup.connect(requestUrl10)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data10 = JSON.parse(response10);

        // Step 2: 캐릭터 상세 정보 가져오기
        var inforUrl11 = MAPLE_INF_API_URL + "?ocid=" + data10.ocid + "&date=" + day_10;
        var response11 = org.jsoup.Jsoup.connect(inforUrl11)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data11 = JSON.parse(response11);

        // Step 3: 이미지 URL 추출
        if (data11.character_image) {
            replier.reply(data11.character_image);
        } else {
            replier.reply("캐릭터 이미지를 찾을 수 없습니다.");
        }
    } catch (error) {
        java.lang.System.out.println("[BOT ERROR] getImage: " + (error.message || error));
        replier.reply("이미지 조회 오류: " + error.message);
    }
}
function getMapleOcid(characterName, replier) {
    try {
        //
       // 기준 시간 생성
var baseDate = new Date();

// 0~4시라면 전날 23시로 맞춤
if (baseDate.getHours() >= 0 && baseDate.getHours() < 6) {
  baseDate.setDate(baseDate.getDate() - 1);
  baseDate.setHours(23, 50, 0, 0);
}

// 이후 로직에서 baseDate를 today로 사용
var today = new Date(baseDate);
var formattedDate =
  today.getFullYear() + "-" +
  String(today.getMonth() + 1).padStart(2, "0") + "-" +
  String(today.getDate()).padStart(2, "0");
var dayText_1 =
  String(today.getMonth() + 1).padStart(2, "0") + "월 " +
  String(today.getDate()).padStart(2, "0") + "일";

var today2 = new Date(today.getTime() - 86400000);
var day_1 =
  today2.getFullYear() + "-" +
  String(today2.getMonth() + 1).padStart(2, "0") + "-" +
  String(today2.getDate()).padStart(2, "0");
var dayText_2 =
  String(today2.getMonth() + 1).padStart(2, "0") + "월 " +
  String(today2.getDate()).padStart(2, "0") + "일";

var today3 = new Date(today.getTime() - 86400000 * 2);
var day_2 =
  today3.getFullYear() + "-" +
  String(today3.getMonth() + 1).padStart(2, "0") + "-" +
  String(today3.getDate()).padStart(2, "0");
var dayText_3 =
  String(today3.getMonth() + 1).padStart(2, "0") + "월 " +
  String(today3.getDate()).padStart(2, "0") + "일";

var today4 = new Date(today.getTime() - 86400000 * 3);
var day_3 =
  today4.getFullYear() + "-" +
  String(today4.getMonth() + 1).padStart(2, "0") + "-" +
  String(today4.getDate()).padStart(2, "0");
var dayText_4 =
  String(today4.getMonth() + 1).padStart(2, "0") + "월 " +
  String(today4.getDate()).padStart(2, "0") + "일";

var today5 = new Date(today.getTime() - 86400000 * 4);
var day_4 =
  today5.getFullYear() + "-" +
  String(today5.getMonth() + 1).padStart(2, "0") + "-" +
  String(today5.getDate()).padStart(2, "0");
var dayText_5 =
  String(today5.getMonth() + 1).padStart(2, "0") + "월 " +
  String(today5.getDate()).padStart(2, "0") + "일";

var today6 = new Date(today.getTime() - 86400000 * 5);
var day_5 =
  today6.getFullYear() + "-" +
  String(today6.getMonth() + 1).padStart(2, "0") + "-" +
  String(today6.getDate()).padStart(2, "0");
var dayText_6 =
  String(today6.getMonth() + 1).padStart(2, "0") + "월 " +
  String(today6.getDate()).padStart(2, "0") + "일";

var today7 = new Date(today.getTime() - 86400000 * 6);
var day_6 =
  today7.getFullYear() + "-" +
  String(today7.getMonth() + 1).padStart(2, "0") + "-" +
  String(today7.getDate()).padStart(2, "0");
var dayText_7 =
  String(today7.getMonth() + 1).padStart(2, "0") + "월 " +
  String(today7.getDate()).padStart(2, "0") + "일";

var today8 = new Date(today.getTime() - 86400000 * 7);
var day_7 =
  today8.getFullYear() + "-" +
  String(today8.getMonth() + 1).padStart(2, "0") + "-" +
  String(today8.getDate()).padStart(2, "0");

// 이번 달 1일 0시 데이터를 가져오기 위해 전달 마지막날 날짜 계산
var today9 = new Date(today.getTime());
today9.setDate(1); // 이번 달 1일
today9.setDate(today9.getDate() - 1); // 하루 빼면 전달 마지막날

var day_8 =
  today9.getFullYear() + "-" +
  String(today9.getMonth() + 1).padStart(2, "0") + "-" +
  String(today9.getDate()).padStart(2, "0");
       
        
        //
        var requestUrl = MAPLE_OCID_API_URL + "?character_name=" + characterName;
        var response = org.jsoup.Jsoup.connect(requestUrl)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)            
            .ignoreContentType(true)
            .execute()
            .body();
        var data = JSON.parse(response);
        //
        var inforUrl = MAPLE_INF_API_URL + "?ocid=" + data.ocid;
        var response2 = org.jsoup.Jsoup.connect(inforUrl)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data2 = JSON.parse(response2);
        
        var inforUrl2 = MAPLE_INF_API_URL + "?ocid=" + data.ocid+"&date="+day_1;
        var response3 = org.jsoup.Jsoup.connect(inforUrl2)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data3 = JSON.parse(response3);
        
        var inforUrl3 = MAPLE_INF_API_URL + "?ocid=" + data.ocid+"&date="+day_2;
        var response4 = org.jsoup.Jsoup.connect(inforUrl3)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            
            .ignoreContentType(true)
            .execute()
            .body();
        var data4 = JSON.parse(response4);
        
        var inforUrl4 = MAPLE_INF_API_URL + "?ocid=" + data.ocid+"&date="+day_3;
        var response5 = org.jsoup.Jsoup.connect(inforUrl4)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            
            .ignoreContentType(true)
            .execute()
            .body();
        var data5 = JSON.parse(response5);
        
        var inforUrl5 = MAPLE_INF_API_URL + "?ocid=" + data.ocid+"&date="+day_4;
        var response6 = org.jsoup.Jsoup.connect(inforUrl5)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data6 = JSON.parse(response6);
        
        var inforUrl6 = MAPLE_INF_API_URL + "?ocid=" + data.ocid+"&date="+day_5;
        var response7 = org.jsoup.Jsoup.connect(inforUrl6)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)
            .ignoreContentType(true)
            .execute()
            .body();
        var data7 = JSON.parse(response7);
        
        var inforUrl7 = MAPLE_INF_API_URL + "?ocid=" + data.ocid+"&date="+day_6;
        var response8 = org.jsoup.Jsoup.connect(inforUrl7)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)            
            .ignoreContentType(true)
            .execute()
            .body();
        var data8 = JSON.parse(response8);
        
        var inforUrl8 = MAPLE_INF_API_URL + "?ocid=" + data.ocid+"&date="+day_7;
        var response9 = org.jsoup.Jsoup.connect(inforUrl8)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)            
            .ignoreContentType(true)
            .execute()
            .body();
        var data9 = JSON.parse(response9);

        // 이번 달 1일 데이터 가져오기
        var inforUrl9 = MAPLE_INF_API_URL + "?ocid=" + data.ocid+"&date="+day_8;
        var response10 = org.jsoup.Jsoup.connect(inforUrl9)
            .header("accept", "application/json")
            .header("x-nxopen-api-key", NEXON_API_KEY)            
            .ignoreContentType(true)
            .execute()
            .body();
        var data10 = JSON.parse(response10);

        // 전투력 조회 (현재 - 표시용)
        var combatPower = 0;
        try {
            var cpUrl = MAPLE_INF_STAT_URL + "?ocid=" + data.ocid;
            var cpResp = org.jsoup.Jsoup.connect(cpUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .execute()
                .body();
            var cpData = JSON.parse(cpResp);
            for (var cs = 0; cs < cpData.final_stat.length; cs++) {
                if (cpData.final_stat[cs].stat_name === "전투력") {
                    combatPower = Number(cpData.final_stat[cs].stat_value);
                    break;
                }
            }
        } catch(e) {}
        var cpText = "";
        if (combatPower >= 1000000000000) cpText = (combatPower / 1000000000000).toFixed(1) + "조";
        else if (combatPower >= 100000000) cpText = (combatPower / 100000000).toFixed(1) + "억";
        else if (combatPower >= 10000) cpText = Math.floor(combatPower / 10000) + "만";
        else cpText = combatPower.toString();
        var cpIcon = "";
        if (combatPower >= 700000000) cpIcon = "👑";
        else if (combatPower >= 500000000) cpIcon = "💎";
        else if (combatPower >= 300000000) cpIcon = "⚔️";
        else if (combatPower >= 100000000) cpIcon = "🛡️";
        else cpIcon = "🗡️";

var expToNext = [
2207026470,
2471869646,
2768494003,
3100713283,
3472798876,
3889534741,
4356278909,
4879032378,
5464516263,
6120258214,
//
7956335678,
8831532602,
9803001188,
10881331318,
12078277762,
15701761090,
17114919588,
18655262350,
20334235961,
22164317197,
//
28813612356,
30830565220,
32988704785,
35297914119,
37768768107,
49099398539,
52536356436,
56213901386,
60148874483,
64359295696,
//
83667084404,
86177096936,
88762409844,
91425282139,
94168040603,
122418452783,
126091006366,
129873736556,
133769948652,
137783047111,
//
179117961244,
184491500081,
190026245083,
195727032435,
201598843408,
262078496430,
269940851322,
278039076861,
286380249166,
294971656640,
//
442457484960,
455731209508,
469403145793,
483485240166,
497989797370,
512929491291,
528317376029,
544166897309,
560491904228,
577306661354,
//
1731919984062,
1749239183902,
1766731575741,
1784398891498,
1802242880412,
2342915744535,
2366344901980,
2390008350999,
2413908434508,
2438047518853,
//
5412465491853,
5466590146771,
5521256048238,
5576468608720,
5632233294807,
11377111255510,
12514822381061,
13766304619167,
15142935081083,
16657228589191,
//
33647601750165,
37012361925181,
40713598117699,
44784957929468,
49263453722414,
99512176519276,
109463394171203,
120409733588323,
132450706947155,
145695777641870,
//
294305470836577,
323736017920234,
356109619712257,
391720581683482,
430892639851830,
870403132500696,
957443445750765,
1053187790325841,
1158506569358425,
1737759854037637];

// 누적 경험치 계산
var cumExp = [0];
for (var i = 0; i < expToNext.length; i++) {
  cumExp[i + 1] = cumExp[i] + expToNext[i];
}

/**
 * 경험치 획득량 계산 함수
 * @param {number} prevLv - 과거 레벨 (1~300)
 * @param {number} prevExp - 과거 레벨 내 경험치
 * @param {number} currLv - 현재 레벨 (1~300)
 * @param {number} currExp - 현재 레벨 내 경험치
 * @returns {number} 획득한 총 경험치
 */
function calcGainedExp(prevLv, prevExp, currLv, currExp) {
  if (
    prevLv < 200 || prevLv > 300 ||
    currLv < 200 || currLv > 300 ||
    (currLv < prevLv || (currLv === prevLv && currExp < prevExp))
  ) {
    throw new Error('잘못된 레벨 입력입니다.');
  }

  var prevTotalExp = cumExp[prevLv - 200] + (prevExp || 0);
  var currTotalExp = cumExp[currLv - 200] + (currExp || 0);

  return Math.max(0, currTotalExp - prevTotalExp);
}
//남은 경험치
function getRemainingExpToNextLevel(currLv, currExp) {
  if (currLv < 1 || currLv >= 300) return 0; // 만렙이거나 이상한 값이면 0
  var requiredForThisLevel = expToNext[currLv - 200]; // 200레벨부터 시작
  return Math.max(0, requiredForThisLevel - currExp);
}
var namexp=getRemainingExpToNextLevel(Number(data2.character_level),Number(data2.character_exp));
var ave=calcGainedExp(Number(data9.character_level),Number(data9.character_exp),
                              Number(data2.character_level),Number(data2.character_exp))/7
        var namexp1=namexp;
        var ave1=ave;                      
        var av="-"
        if(ave>=1000000000000)
        {
          ave=ave/1000000000000;
          av="조";
        }
        else if(ave>=100000000)
        {
          ave=ave/100000000;
          av="억";
        }
        else if(ave>=10000)
        {
          ave=ave/10000;
          av="만";
        }
        else
        {
          av="-";
        }
        var av2="-"
        if(namexp>=1000000000000)
        {
          namexp=namexp/1000000000000;
          av2="조";
        }
        else if(namexp>=100000000)
        {
          namexp=namexp/100000000;
          av2="억";
        }
        else if(namexp>=10000)
        {
          namexp=namexp/10000;
          av2="만";
        }
        else
        {
          av2="-";
        }

        // 이번 달 경험치 평균 계산
        var today_date = new Date(today.getTime());
        var monthFirstDate = new Date(today.getTime());
        monthFirstDate.setDate(1); // 이번 달 1일

        today_date.setHours(0, 0, 0, 0);
        monthFirstDate.setHours(0, 0, 0, 0);
        var daysInMonth = Math.floor((today_date - monthFirstDate) / 86400000) + 1; // 1일부터 오늘까지 일수

        var monthlyAvgExp = null;
        if (daysInMonth > 0 && data10 && data10.character_level != null && data10.character_exp != null) {
            monthlyAvgExp = calcGainedExp(
                Number(data10.character_level),
                Number(data10.character_exp),
                Number(data2.character_level),
                Number(data2.character_exp)
            ) / daysInMonth;
        }

        var monthlyAve = monthlyAvgExp;
        var monthlyAv = "";
        if (monthlyAve != null) {
            if (monthlyAve >= 1000000000000) {
                monthlyAve = monthlyAve / 1000000000000;
                monthlyAv = "조";
            } else if (monthlyAve >= 100000000) {
                monthlyAve = monthlyAve / 100000000;
                monthlyAv = "억";
            } else if (monthlyAve >= 10000) {
                monthlyAve = monthlyAve / 10000;
                monthlyAv = "만";
            }
        }

        var Tag="헤르메스";
        if(decodeURIComponent(characterName)=="영디")
        {
          Tag="Empepor⚜️";
        }
        else if(decodeURIComponent(characterName)=="플로렌스")
        {
          Tag="신";
          }
        else if(decodeURIComponent(characterName)=="뭘해도우냥")
        {
          Tag="⚔︎ 10만 Knight ⚔︎";
          }
        else if(decodeURIComponent(characterName)=="아퐁")
        {
          Tag="🤍 천 사 🤍";
        }
        else if(decodeURIComponent(characterName)=="좋냥")
        {
          Tag="여신의 ⚔︎기사⚔︎";
        }
        else if(decodeURIComponent(characterName)=="가람님")
        {
          Tag="8서클 ❄️마법사 ⚾";
        }
        else if(decodeURIComponent(characterName)=="월하살"||decodeURIComponent(characterName)=="높푸")
        {
          Tag="전설 사냥꾼";
        }
        else if(decodeURIComponent(characterName)=="렌영v")
        {
          Tag="토끼 왕👑";
        }
        else if(decodeURIComponent(characterName)=="멍붕바오")
        {
          Tag="토끼 기사님 ♞ ⚔️";
        }
        else if(decodeURIComponent(characterName)=="렌가용")
        {
          Tag="토끼 검사님⚔️";
        }
        else if(decodeURIComponent(characterName)=="페에멜라")
        {
          Tag="토끼 신⚜️";
        }
        else if(decodeURIComponent(characterName)=="활쏘러가여")
        {
          Tag="빛나는 별 🌟";
        }
        else if(decodeURIComponent(characterName)=="Zz겨울")
        {
          Tag="마스테리아 마족";
        }
        else if(decodeURIComponent(characterName)=="아스티핀")
        {
          Tag=" 11/04입대 🪖";
        }
        else if(decodeURIComponent(characterName)=="다크나이이뚜")
        {
          Tag="악 마";
        }
        else if(decodeURIComponent(characterName)=="그리즈")
        {
          Tag="🐰 월하검귀 🌙";
        }
        else if(decodeURIComponent(characterName)=="메Lia")
        {
          Tag="초급ㅣ엘프";
        }
        else if(decodeURIComponent(characterName)=="보리먹은토끼")
        {
          Tag="⚸ 🌙토끼 검사⚔️";
        }
        else if(decodeURIComponent(characterName)=="TreySongz")
        {
          Tag="⚸ 🌙토끼 검사⚔️";
        }
        else if(decodeURIComponent(characterName)=="화령작")
        {
          Tag="⏳신의 아이⏳";
        }
        else if(decodeURIComponent(characterName)=="태엽준")
        {
          Tag="⏳시간 속 모험가⏳";
        }
        else if(decodeURIComponent(characterName)=="키보입니다만")
        {
          Tag="༺ᡣ𐭩༻아크";
        }
        else if(decodeURIComponent(characterName)=="덕고미콩")
        {
          Tag="⋆⁺₊⋆여 신⋆⁺₊⋆";
        }
        else if(decodeURIComponent(characterName)=="꿍색")
        {
          Tag="♚ Boss King ♚";
        }
        else if(decodeURIComponent(characterName)=="꿍꿍색")
        {
          Tag="Rising Star";
        }
        else if(decodeURIComponent(characterName)=="늘귤")
        {
          Tag="⚔︎ 10만 Knight ⚔︎";
        }
        else if(decodeURIComponent(characterName)=="너조아")
        {
          Tag="예쁜 별 ⍣";
        }
        else if(decodeURIComponent(characterName)=="유랑극단")
        {
          Tag="새로운 별 💫";
        }
        else if(decodeURIComponent(characterName)=="센애")
        {
          Tag="새로운 별 💫";
        }
        else if(decodeURIComponent(characterName)=="친창")
        {
          Tag="에반의 신💫";
        }
        else if(decodeURIComponent(characterName)=="내티")
        {
          Tag="에반의 귀염둥이";
        }
        else if(decodeURIComponent(characterName)=="너굴님")
        {
          Tag="\n                    🦝꼬마너구리🐾";
        }
         else if(decodeURIComponent(characterName)=="솔트")
        {
          Tag="내부지표의 수호자⛨ †";
        }
        else if(decodeURIComponent(characterName)=="공가")
        {
          Tag="공갈";
        }
        else if(decodeURIComponent(characterName)=="패스트푸드")
        {
          Tag="숨겨진 딜사이클 보유자";
        }
         else if(decodeURIComponent(characterName)=="Evan마츠")
        {
          Tag="구르메 마츠";
        }
        
        else if(decodeURIComponent(characterName)=="개미집구석")
        {
          Tag="숨겨진 딜사이클 보유자";
        }
        else if(decodeURIComponent(characterName)=="금발태닝께보")
        {
          Tag="패링 ⛨ †";
        }
        
        else if(decodeURIComponent(characterName)=="주다혜a")
        {
          Tag="푸른 별";
        }
        else if(decodeURIComponent(characterName)=="솔짱쓰")
        {
          Tag="⋆⁺₊길드 지휘자⋆⁺₊👑";
          }
          else if(decodeURIComponent(characterName)=="솔짱쓰")
        {
          Tag="⋆파괴자⋆";
          }
        else if(decodeURIComponent(characterName)=="세희아님")
        {
          Tag="⋆⁺₊⋆ 빛 어둠 ⋆⁺₊⋆"
        }
        else if(decodeURIComponent(characterName)=="실직듀블")
        {
          Tag="🐢🐢......."
        }
        else if(decodeURIComponent(characterName)=="주다해a")
        {
          Tag="5서클 ❄️마법사";
        }
        else if(decodeURIComponent(characterName)=="별희연")
        {
          Tag="⋆⁺₊⋆스타포스 여 신⋆⁺₊⋆";
        }
        else if(decodeURIComponent(characterName)=="멕시칸보이")
        {
          Tag="귀욤뾰짝 보이 💫";
        }
        else if(decodeURIComponent(characterName)=="쏘쏘렌짱")
        {
          Tag="도전자";
        }
        else if(decodeURIComponent(characterName)=="뇽멍뭉이")
        {
          Tag="⏳시간 속 모험가⏳";
        }
        else if(decodeURIComponent(characterName)=="냥심무")
        {
          Tag="고양이귀 엘프♡";
        }
        else if(decodeURIComponent(characterName)=="렌멍뭉이")
        {
          Tag="개가 되고픈 토끼";
        }
        else if(decodeURIComponent(characterName)=="달마름")
        {
          Tag="༺ᡣ𐭩༻";
        }
         else if(decodeURIComponent(characterName)=="빌콩")
        {
          Tag="༺♥༻";
        }
          else if(decodeURIComponent(characterName)=="지봉이")
        {
          Tag="전설의 아저씨";
        }
          else if(decodeURIComponent(characterName)=="솜뎡")
        {
          Tag="이뿌니";
        }
        else if(decodeURIComponent(characterName)=="브경")
        {
          Tag="⋆⁺₊⋆여 신⋆⁺₊⋆";
        }
        else if(decodeURIComponent(characterName)=="알천a")
        {
          Tag="방패병 ⛨ ";
        }
        else if(decodeURIComponent(characterName)=="렌낭낭이펀치")
        {
          Tag="🌙토끼 검사님⚔️";
        }
        else if(decodeURIComponent(characterName)=="혈묘화")
        {
          Tag="토끼 왕👑"
        }
        else if(decodeURIComponent(characterName)=="응애1칸")
        {
          Tag="저격 왕 🪖";
        }
         else if(decodeURIComponent(characterName)=="박세웅")
        {
          Tag="에반 수장님";
        }
        else if(decodeURIComponent(characterName)=="코코섬")
        {
          Tag="🌙 밤의 표창술사";
        }
        else if(decodeURIComponent(characterName)=="가령성우팬")
        {
          Tag="🌿 대지의 주술사";
        }
        else if(decodeURIComponent(characterName)=="간둥잇")
        {
          Tag="⚔️ 달빛 검사";
        }
        else if(decodeURIComponent(characterName)=="국진시치")
        {
          Tag="🔥 불꽃의 마법사";
        }
        else if(decodeURIComponent(characterName)=="그대솜이")
        {
          Tag="⚔️ 바람의 검사";
        }
        else if(decodeURIComponent(characterName)=="껌요")
        {
          Tag="🌙 그림자 표창사";
        }
        else if(decodeURIComponent(characterName)=="냥연진")
        {
          Tag="✨ 성스러운 사제";
        }
        else if(decodeURIComponent(characterName)=="뜯든")
        {
          Tag="⚔️ 칠흑의 검사";
        }
        else if(decodeURIComponent(characterName)=="가상토벤")
        {
          Tag="🏹 황금의 궁수";
        }
        else if(decodeURIComponent(characterName)=="나로떵민")
        {
          Tag="🗡️ 밤의 암살자";
        }
        else if(decodeURIComponent(characterName)=="렌영서")
        {
          Tag="⚔️ 은빛 검사";
        }
        else if(decodeURIComponent(characterName)=="씨단")
        {
          Tag="⚔️ 황혼의 검사";
        }
        else if(decodeURIComponent(characterName)=="쭌뚜")
        {
          Tag="🗡️ 쌍검의 무인";
        }
        else if(decodeURIComponent(characterName)=="머퓌")
        {
          Tag="🔥 화염의 마도사";
        }
        else if(decodeURIComponent(characterName)=="무지개오라")
        {
          Tag="✨ 전투 마법사";
        }
        else if(decodeURIComponent(characterName)=="믈빙건")
        {
          Tag="⛓️ 쇄혼의 사냥꾼";
        }
        else if(decodeURIComponent(characterName)=="범고래당")
        {
          Tag="🔱 빙하의 전사";
        }
        else if(decodeURIComponent(characterName)=="별의달빛사수")
        {
          Tag="🏹 달빛의 명궁";
        }
        else if(decodeURIComponent(characterName)=="보마Lia")
        {
          Tag="🏹 빛의 궁수";
        }
        else if(decodeURIComponent(characterName)=="살귤")
        {
          Tag="⛓️ 어둠의 쇄사";
        }
        else if(decodeURIComponent(characterName)=="수심각")
        {
          Tag="🗡️ 심연의 암살자";
        }
        else if(decodeURIComponent(characterName)=="애스끼")
        {
          Tag="🎩 환상의 마술사";
        }
        else if(decodeURIComponent(characterName)=="오늘만사또")
        {
          Tag="⚔️ 떠도는 검객";
        }
        else if(decodeURIComponent(characterName)=="유현곰")
        {
          Tag="⚔️ 숲의 검사";
        }
        else if(decodeURIComponent(characterName)=="이렐프리데")
        {
          Tag="⚔️ 튜너의 기사";
        }
        else if(decodeURIComponent(characterName)=="재획대표")
        {
          Tag="🔥 불꽃의 대마법사";
        }
        else if(decodeURIComponent(characterName)=="주창아")
        {
          Tag="🏹 고대의 명궁";
        }
        else if(decodeURIComponent(characterName)=="총을써보자")
        {
          Tag="🔫 바다의 사격수";
        }
        else if(decodeURIComponent(characterName)=="춤추는신두형")
        {
          Tag="🏹 춤추는 궁수";
        }
        else if(decodeURIComponent(characterName)=="토로우유")
        {
          Tag="⚔️ 새벽의 검사";
        }
        else if(decodeURIComponent(characterName)=="팟디")
        {
          Tag="🗡️ 밤의 지배자";
        }
        else if(decodeURIComponent(characterName)=="처단")
        {
          Tag="⚔️ 단죄의 검신";
        }
        else if(decodeURIComponent(characterName)=="샤쯔")
        {
          Tag="🔱 흑염의 창기사";
        }
        else if(decodeURIComponent(characterName)=="병겁")
        {
          Tag="🗡️ 공포의 암살자";
        }
        else if(decodeURIComponent(characterName)=="홍차샌드")
        {
          Tag="🍵 홍차의 검사";
        }
        else if(decodeURIComponent(characterName)=="굼뱅이상자")
        {
          Tag="✨ 빛의 상자";
        }
        else if(decodeURIComponent(characterName)=="제육쌈밥사장")
        {
          Tag="🏹 신비의 명사수";
        }
        else if(decodeURIComponent(characterName)=="썬쿨")
        {
          Tag="❄️ 빙결의 마법사";
        }
        else if(decodeURIComponent(characterName)=="조믈")
        {
          Tag="🗡️ 도깨비 도술사";
        }
        else if(decodeURIComponent(characterName)=="챠쩡")
        {
          Tag="✨ 빛의 사제";
        }
        else if(decodeURIComponent(characterName)=="치타")
        {
          Tag="✨ 치유의 사제";
        }
        else if(decodeURIComponent(characterName)=="습기")
        {
          Tag="✨ 물안개의 사제";
        }
        else if(decodeURIComponent(characterName)=="저장")
        {
          Tag="⏳ 저장된 시간";
        }
        else if(decodeURIComponent(characterName)=="이블서번트")
        {
          Tag="✨ 어둠의 사제";
        }
        else if(decodeURIComponent(characterName)=="라넬사해")
        {
          Tag="✨ 사해의 마도사";
        }
        else if(decodeURIComponent(characterName)=="근띠깅")
        {
          Tag="👊 근성의 격투가";
        }
        else if(decodeURIComponent(characterName)=="꼬야씨")
        {
          Tag="⛨ 꼬야 기사님";
        }
        else if(decodeURIComponent(characterName)=="리곰")
        {
          Tag="🐻 곰의 검사";
        }
        else if(decodeURIComponent(characterName)=="으때")
        {
          Tag="🏹 바람의 궁수";
        }
        else if(decodeURIComponent(characterName)=="세렌팬티도둑")
        {
          Tag="🎩 세렌의 도둑";
        }
        else if(decodeURIComponent(characterName)=="이겜처음함뭐")
        {
          Tag="🏹 초보(?) 궁수";
        }
        else if(decodeURIComponent(characterName)=="김개똥")
        {
          Tag="🏹 질풍의 궁수";
        }
        else if(decodeURIComponent(characterName)=="태준바라깅")
        {
          Tag="⚔️ 칼날의 기사";
        }
        else if(decodeURIComponent(characterName)=="초쿄레니")
        {
          Tag="⚔️ 달콤한 검사";
        }
        else if(decodeURIComponent(characterName)=="나준희")
        {
          Tag="✨ 빛과 어둠";
        }
        else if(decodeURIComponent(characterName)=="데슬가논")
        {
          Tag="😈 가논의 악마";
        }
        else if(decodeURIComponent(characterName)=="승에")
        {
          Tag="💥 포격의 용사";
        }
        else if(decodeURIComponent(characterName)=="강떠")
        {
          Tag="🗡️ 강류 쌍검";
        }
        else if(decodeURIComponent(characterName)=="링크노예장인")
        {
          Tag="😈 링크의 악마";
        }
        else if(decodeURIComponent(characterName)=="도횬갓")
        {
          Tag="⚔️ 혼의 전사";
        }
        else if(decodeURIComponent(characterName)=="차등")
        {
          Tag="🎩 차등의 마술사";
        }
        else if(decodeURIComponent(characterName)=="팔라딘약한듯")
        {
          Tag="⛨ 약한(?) 수호자";
        }
        else if(decodeURIComponent(characterName)=="숌쁘")
        {
          Tag="✨ 축복의 사제";
        }
        else if(decodeURIComponent(characterName)=="태준시치")
        {
          Tag="⚔️ 태양의 검사";
        }
        else if(decodeURIComponent(characterName)=="리인카잭")
        {
          Tag="🔱 환생의 기사";
        }
        else if(decodeURIComponent(characterName)=="나우테크시치")
        {
          Tag="⚔️ 미래의 검사";
        }
        else if(decodeURIComponent(characterName)=="뿌뿍")
        {
          Tag="🗡️ 뿌뿍 쌍검";
        }
        else if(decodeURIComponent(characterName)=="폭류원킬사냥")
        {
          Tag="👊 여우의 격투가";
        }
        else if(decodeURIComponent(characterName)=="서울꽃삼")
        {
          Tag="⚔️ 꽃의 혼";
        }
        else if(decodeURIComponent(characterName)=="전포대로133")
        {
          Tag="⚔️ 전포의 검사";
        }
        else if(decodeURIComponent(characterName)=="수호신")
        {
          Tag="👊 수호의 격투가";
        }
        else if(decodeURIComponent(characterName)=="보우멜라")
        {
          Tag="🏹 멜라 궁수";
        }
        else if(decodeURIComponent(characterName)=="몰랑용사")
        {
          Tag="🏹 몰랑 궁수";
        }
        else if(decodeURIComponent(characterName)=="라모니움")
        {
          Tag="✨ 빛과 어둠";
        }
        else if(decodeURIComponent(characterName)=="뎃카이")
        {
          Tag="⛨ 수호의 기사";
        }
        else if(decodeURIComponent(characterName)=="뽀야캡짱")
        {
          Tag="🔫 뽀야 선장";
        }
        else if(decodeURIComponent(characterName)=="꼬마모찌")
        {
          Tag="✨ 모찌 사제";
        }
        else if(decodeURIComponent(characterName)=="Rabbitwren")
        {
          Tag="🐰 토끼굴 검사";
        }
        else if(decodeURIComponent(characterName)=="오뭬리")
        {
          Tag="⚔️ 떠돌이 검사";
        }
        else if(decodeURIComponent(characterName)=="깡총뽀야")
        {
          Tag="🐰 깡총 검사";
        }
        else if(decodeURIComponent(characterName)=="유지후")
        {
          Tag="🔱 어둠의 기사";
        }
        else if(decodeURIComponent(characterName)=="질풍준")
        {
          Tag="⚡ 질풍의 격투가";
        }
        else if(decodeURIComponent(characterName)=="뽀야노래할게")
        {
          Tag="💖 노래하는 천사";
        }
        else if(decodeURIComponent(characterName)=="젓걜")
        {
          Tag="🗡️ 은밀한 쌍검";
        }
        else if(decodeURIComponent(characterName)=="태준v")
        {
          Tag="🗡️ 질풍 쌍검";
        }
        else if(decodeURIComponent(characterName)=="유랑준")
        {
          Tag="⚔️ 유랑 검사";
        }
        else if(decodeURIComponent(characterName)=="바텀바두기")
        {
          Tag="⚔️ 바둑 검사";
        }
        else if(decodeURIComponent(characterName)=="호위단")
        {
          Tag="⏳ 시간의 호위자";
        }
        else if(decodeURIComponent(characterName)=="아오렌시치")
        {
          Tag="⚔️ 푸른 검사";
        }
        else if(decodeURIComponent(characterName)=="흑화꼬마법사")
        {
          Tag="✨ 흑화 마법사";
        }
        else if(decodeURIComponent(characterName)=="돈모으는자")
        {
          Tag="🏹 고대의 궁수";
        }
        else if(decodeURIComponent(characterName)=="표제드")
        {
          Tag="🗡️ 표창의 달인";
        }
        else if(decodeURIComponent(characterName)=="홍기레렌")
        {
          Tag="⚔️ 붉은 검사";
        }
        else if(decodeURIComponent(characterName)=="옹균리")
        {
          Tag="👊 균형의 격투가";
        }
        else if(decodeURIComponent(characterName)=="임중휘")
        {
          Tag="⚔️ 빛나는 혼";
        }
        else if(decodeURIComponent(characterName)=="이뿌니고미")
        {
          Tag="⚔️ 화사한 검사";
        }
        else if(decodeURIComponent(characterName)=="진담토")
        {
          Tag="⚔️ 진실의 기사";
        }
        else if(decodeURIComponent(characterName)=="엘리멤")
        {
          Tag="🌿 대지의 요정";
        }
        else if(decodeURIComponent(characterName)=="징쨩렌")
        {
          Tag="⚔️ 짱 검사";
        }
        else if(decodeURIComponent(characterName)=="돌풍준")
        {
          Tag="🏹 돌풍의 궁수";
        }
        else if(decodeURIComponent(characterName)=="유렬")
        {
          Tag="😈 열화의 악마";
        }
        else if(decodeURIComponent(characterName)=="므마")
        {
          Tag="⚔️ 무명 검사";
        }
        else if(decodeURIComponent(characterName)=="티삼스")
        {
          Tag="⚔️ 세 번째 검";
        }
        else if(decodeURIComponent(characterName)=="Lorence")
        {
          Tag="⚔️ 로렌스 기사";
        }
        else if(decodeURIComponent(characterName)=="윤하지은")
        {
          Tag="🏹 은빛 궁수";
        }
        else if(decodeURIComponent(characterName)=="오멘준")
        {
          Tag="🌙 어둠의 표창사";
        }
        else if(decodeURIComponent(characterName)=="휴지의산책")
        {
          Tag="🧠 산책하는 초능력자";
        }
        else if(decodeURIComponent(characterName)=="니얼굴고미")
        {
          Tag="🗡️ 이중의 칼날";
        }
        else if(decodeURIComponent(characterName)=="좋냥플래그용")
        {
          Tag="⚡ 플래그 전사";
        }
        else if(decodeURIComponent(characterName)=="MZ고미")
        {
          Tag="⚔️ MZ 전사";
        }
        else
        {
         Tag=" ";
        }
        
        
        var avetext=" "
        if(ave>=4000)
        {
          avetext="(거북이)🐢"
        }
        else if(ave>=50)
        {
          avetext="(사망)"
        }
        else if(ave>=15)
        {
          avetext="(창세)"
        }
        else if(ave>=12)
        {
          avetext="(초월)"
        }
        else if(ave>=9)
        {
          avetext="(에테르)"
        }
        else if(ave>=6)
        {
          avetext="(레전더리)"
        }
        else if(ave>=4)
        {
          avetext="(유니크)"
        }
        else if(ave>=3)
        {
          avetext="(에픽)"
        }
        else if(ave>=2)
        {
          avetext="(레어)"
        }
        else if(ave>=1)
        {
          avetext="(노멀)"
        }
        // 판타지 칭호 (고정 - 30일 최고치 기준 126명)
        var fantasyTags = {
            "처단": "⚔️ 천하제일검",
            "영디": "⛓️ 쇄혼의 지배자",
            "페에멜라": "⚔️ 천하제일검",
            "뭘해도우냥": "🗡️ 그림자의 지배자",
            "쭌뚜": "🗡️ 그림자의 지배자",
            "병겁": "🗡️ 그림자의 지배자",
            "샤쯔": "🔱 창의 신",
            "머퓌": "✨ 대현자",
            "주창아": "🏹 천공의 명사수",
            "믈빙건": "⛓️ 쇄혼의 지배자",
            "홍차샌드": "⚔️ 천하제일검",
            "늘귤": "🗡️ 그림자의 지배자",
            "덕고미콩": "⚔️ 천하제일검",
            "도횬갓": "⚔️ 천하제일검",
            "팟디": "🗡️ 그림자의 지배자",
            "굼뱅이상자": "✨ 현자",
            "재획대표": "✨ 현자",
            "렌영v": "⚔️ 왕국 대검사",
            "제육쌈밥사장": "🏹 전설의 사냥꾼",
            "활쏘러가여": "🏹 전설의 사냥꾼",
            "플로렌스": "✨ 현자",
            "썬쿨": "✨ 현자",
            "아스티핀": "😈 대악마",
            "유랑극단": "👊 전설의 해적",
            "꼬야씨": "⚔️ 왕국 대검사",
            "좋냥": "⚔️ 왕국 대검사",
            "조믈": "🗡️ 왕국 밀정",
            "치타": "✨ 대마법사",
            "세렌팬티도둑": "🗡️ 왕국 밀정",
            "습기": "✨ 대마법사",
            "태엽준": "⚔️ 시간의 수호자",
            "챠쩡": "✨ 대마법사",
            "너조아": "🗡️ 왕국 밀정",
            "저장": "⚔️ 시간의 수호자",
            "간둥잇": "⚔️ 성검의 기사",
            "다크나이이뚜": "🔱 용창 기사",
            "라넬사해": "✨ 대마법사",
            "이블서번트": "✨ 대마법사",
            "화령작": "⚔️ 시간의 수호자",
            "무지개오라": "✨ 대마법사",
            "근띠깅": "👊 왕국 용병",
            "리곰": "⚔️ 왕국 기사",
            "멍붕바오": "⚔️ 왕국 기사",
            "국진시치": "✨ 궁정 마법사",
            "그리즈": "⚔️ 만검을 지배하는 자",
            "으때": "🏹 왕국 궁수",
            "이겜처음함뭐": "🏹 왕국 궁수",
            "뜯든": "⚔️ 왕국 기사",
            "김개똥": "🏹 왕국 궁수",
            "아오렌시치": "⚔️ 왕국 기사",
            "그대솜이": "⚔️ 왕국 기사",
            "수심각": "🗡️ 암살자",
            "살귤": "⛓️ 체인 마스터",
            "숌쁘": "✨ 궁정 마법사",
            "센애": "⚔️ 왕국 기사",
            "태준바라깅": "⚔️ 왕국 기사",
            "승에": "👊 해적",
            "냥연진": "✨ 궁정 마법사",
            "초쿄레니": "⚔️ 왕국 기사",
            "나준희": "✨ 궁정 마법사",
            "강떠": "🗡️ 암살자",
            "데슬가논": "😈 악마 전사",
            "차등": "🗡️ 암살자",
            "가령성우팬": "✨ 궁정 마법사",
            "링크노예장인": "😈 악마 전사",
            "팔라딘약한듯": "⚔️ 왕국 기사",
            "리인카잭": "🔱 왕국 창기사",
            "태준시치": "⚔️ 왕국 기사",
            "유현곰": "⚔️ 왕국 기사",
            "별의달빛사수": "🏹 왕국 궁수",
            "뿌뿍": "🗡️ 암살자",
            "금발태닝께보": "⚔️ 왕국 기사",
            "총을써보자": "🔫 수련 사격수",
            "수호신": "👊 수련 격투가",
            "나우테크시치": "⚔️ 수련 기사",
            "껌요": "🗡️ 수련 도적",
            "TreySongz": "⚔️ 수련 기사",
            "서울꽃삼": "⚔️ 수련 기사",
            "폭류원킬사냥": "👊 수련 격투가",
            "나로떵민": "🗡️ 수련 도적",
            "전포대로133": "⚔️ 수련 기사",
            "태준v": "🗡️ 수련 도적",
            "보우멜라": "🏹 수련 궁수",
            "춤추는신두형": "🏹 수련 궁수",
            "몰랑용사": "🏹 수련 궁수",
            "뽀야캡짱": "🔫 수련 사격수",
            "뎃카이": "⚔️ 수련 기사",
            "옹균리": "👊 수련 격투가",
            "꼬마모찌": "✨ 수련 마법사",
            "라모니움": "✨ 수련 마법사",
            "돌풍준": "🏹 수련 궁수",
            "씨단": "⚔️ 수련 기사",
            "Rabbitwren": "⚔️ 수련 기사",
            "유지후": "🔱 수련 창병",
            "오뭬리": "⚔️ 수련 기사",
            "토로우유": "⚔️ 수련 기사",
            "아퐁": "✨ 수련 마법사",
            "질풍준": "👊 수련 격투가",
            "깡총뽀야": "⚔️ 수련 기사",
            "엘리멤": "✨ 수련 마법사",
            "젓걜": "🗡️ 수련 도적",
            "코코섬": "🗡️ 수련 도적",
            "뽀야노래할게": "🔫 수련 사격수",
            "흑화꼬마법사": "✨ 수련 마법사",
            "호위단": "⚔️ 시간의 수련생",
            "바텀바두기": "⚔️ 수련 기사",
            "유랑준": "⚔️ 수련 기사",
            "표제드": "🗡️ 수련 도적",
            "돈모으는자": "🏹 수련 궁수",
            "홍기레렌": "⚔️ 수련 기사",
            "임중휘": "⚔️ 수련 기사",
            "진담토": "⚔️ 수련 기사",
            "이뿌니고미": "⚔️ 수련 기사",
            "가상토벤": "🏹 수련 궁수",
            "Lorence": "⚔️ 수련 기사",
            "티삼스": "⚔️ 수련 기사",
            "유렬": "😈 수련 악마",
            "징쨩렌": "⚔️ 견습 검사",
            "므마": "⚔️ 견습 검사",
            "윤하지은": "🏹 견습 궁수",
            "이렐프리데": "⚔️ 견습 검사",
            "오멘준": "🗡️ 견습 도적",
            "휴지의산책": "✨ 견습 마법사",
            "니얼굴고미": "🗡️ 견습 도적",
            "좋냥플래그용": "⚡ 견습 전투원",
            "MZ고미": "⚔️ 견습 검사"
        };
        var fantasyTag = fantasyTags[decodeURIComponent(characterName)] || "";

        var lvup=" ";
        if(data3.character_level<data2.character_level)
        {
          lvup="\n🥳"+decodeURIComponent(characterName) +"님 레벨업 축하드립니다🎉🎉."
        }

        var lvupdate= new Date(Date.now()+86400000*(namexp1/ave1));
        var upday=
          lvupdate.getFullYear() + "년" +
          String(lvupdate.getMonth() + 1).padStart(2, "0") + "월" +
          String(lvupdate.getDate()).padStart(2, "0")+ "일" ;
        if (data.ocid) {
    var tagLine = (Tag && Tag.trim() !== "") ? "\n" + Tag : "";
    var fantasyLine = (fantasyTag && fantasyTag.trim() !== "") ? "\n" + fantasyTag : "";
    replier.reply("[" + decodeURIComponent(characterName) + "]  " + cpText + " " + cpIcon + tagLine + fantasyLine + "\n"
        + dayText_7 + " Lv." + data8.character_level + " " + data8.character_exp_rate + "% +" + getExpDiffText(data9.character_level, data9.character_exp_rate, data8.character_level, data8.character_exp_rate) + "\n"
        + dayText_6 + " Lv." + data7.character_level + " " + data7.character_exp_rate + "% +" + getExpDiffText(data8.character_level, data8.character_exp_rate, data7.character_level, data7.character_exp_rate) + "\n"
        + dayText_5 + " Lv." + data6.character_level + " " + data6.character_exp_rate + "% +" + getExpDiffText(data7.character_level, data7.character_exp_rate, data6.character_level, data6.character_exp_rate) + "\n"
        + dayText_4 + " Lv." + data5.character_level + " " + data5.character_exp_rate + "% +" + getExpDiffText(data6.character_level, data6.character_exp_rate, data5.character_level, data5.character_exp_rate) + "\n"
        + dayText_3 + " Lv." + data4.character_level + " " + data4.character_exp_rate + "% +" + getExpDiffText(data5.character_level, data5.character_exp_rate, data4.character_level, data4.character_exp_rate) + "\n"
        + dayText_2 + " Lv." + data3.character_level + " " + data3.character_exp_rate + "% +" + getExpDiffText(data4.character_level, data4.character_exp_rate, data3.character_level, data3.character_exp_rate) + "\n"
        + dayText_1 + " Lv." + data2.character_level + " " + data2.character_exp_rate + "% +" + getExpDiffText(data3.character_level, data3.character_exp_rate, data2.character_level, data2.character_exp_rate) + "\n\n"
        + "일주일 평균 획득량 : " + ave.toFixed(1) + " " + av + avetext + "\n"
        + "남은 경험치량 :  " + namexp.toFixed(1) + " " + av2 + "\n"
        + "예상 레벨업 날짜 : " + upday + lvup + "\n"
        + "이번 달 평균 획득량 : " + (monthlyAve != null ? monthlyAve.toFixed(1) + " " + monthlyAv : "null") + " (" + daysInMonth + "일간)"
    );

}
        else {
            replier.reply("해당 캐릭터를 찾을 수 없습니다.");
        }
    } catch (error) {
        var errMsg = error.message || String(error);
        java.lang.System.out.println("[BOT ERROR] getMapleOcid: " + errMsg);
        if (errMsg.indexOf("HTTP error") !== -1) {
            replier.reply("API 호출 실패 (서버 점검 또는 요청 오류)\n" + errMsg);
        } else {
            replier.reply("새벽점검시간 혹은 월드리프, 생성일이 일주일이 되지 않음\n(상세: " + errMsg + ")");
        }
        return;
    }
    function getRealExp(level, rate) {
    level = Number(level);
    rate = Number(rate);
    if (level < 200 || level >= 300) return 0;
    var expToNextLevel = expToNext[level - 200]; // index = level - 200
    return expToNextLevel * (rate / 100);
}
    function formatExp(exp) {
    if (exp >= 1e12) { // 1조 이상
        return (exp / 1e12).toFixed(1) + "조";
    } else if (exp >= 1e8) { // 1억 이상
        return Math.floor(exp / 1e8) + "억";
    } else if (exp >= 1e4) { // 1만 이상
        return Math.floor(exp / 1e4) + "만";
    } else {
        return Math.floor(exp).toString();
    }

}
    function getExpDiffText(prevLevel, prevRate, currLevel, currRate) {
    var prevExp = getRealExp(prevLevel, prevRate);
    var currExp = getRealExp(currLevel, currRate);

    var gainedExp = 0;
    if (currLevel === prevLevel) {
        gainedExp = currExp - prevExp;
    } else if (currLevel > prevLevel) {
        // 레벨업 경험치 계산
        var expRemainingPrev = getRealExp(prevLevel, 100) - prevExp;
        var midTotal = 0;
        for (var lv = prevLevel + 1; lv < currLevel; lv++) {
            midTotal += expToNext[lv - 200];
        }
        gainedExp = expRemainingPrev + midTotal + currExp;
    }

    if (gainedExp <= 0) return 0;
    return formatExp(gainedExp);
}
}

// 장비 조회 함수
function getEquipment(characterName, replier, slotFilter) {
    var thread = new java.lang.Thread(function() {
        try {
            // OCID 조회
            var ocidUrl = MAPLE_OCID_API_URL + "?character_name=" + characterName;
            var ocidResp = org.jsoup.Jsoup.connect(ocidUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .execute()
                .body();
            var ocidData = JSON.parse(ocidResp);

            // 메소/드롭 옵션 체크 함수
            function hasDropMesoOption(data) {
                if (!data.item_equipment) return false;
                for (var i = 0; i < data.item_equipment.length; i++) {
                    var item = data.item_equipment[i];
                    var opts = [
                        item.potential_option_1, item.potential_option_2, item.potential_option_3,
                        item.additional_potential_option_1, item.additional_potential_option_2, item.additional_potential_option_3
                    ];
                    for (var j = 0; j < opts.length; j++) {
                        if (opts[j] && (opts[j].indexOf("메소") !== -1 || opts[j].indexOf("드롭") !== -1)) {
                            return true;
                        }
                    }
                }
                return false;
            }

            // 날짜 포맷 함수
            function formatDate(d) {
                return d.getFullYear() + "-" +
                    String(d.getMonth() + 1).padStart(2, "0") + "-" +
                    String(d.getDate()).padStart(2, "0");
            }

            // 장비 조회 (먼저 오늘 데이터)
            var equipUrl = MAPLE_ITEM_EQUIPMENT_URL + "?ocid=" + ocidData.ocid;
            var equipResp = org.jsoup.Jsoup.connect(equipUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .execute()
                .body();
            var equipData = JSON.parse(equipResp);

            // 메소/드롭 옵션이 있으면 이전 날짜 확인
            if (hasDropMesoOption(equipData)) {
                for (var dayBack = 2; dayBack <= 8; dayBack++) {
                    try {
                        var pastDate = new Date(Date.now() - 86400000 * dayBack);
                        var dateStr = formatDate(pastDate);
                        var pastUrl = MAPLE_ITEM_EQUIPMENT_URL + "?ocid=" + ocidData.ocid + "&date=" + dateStr;
                        var pastConn = org.jsoup.Jsoup.connect(pastUrl)
                            .header("accept", "application/json")
                            .header("x-nxopen-api-key", NEXON_API_KEY)
                            .ignoreContentType(true)
                            .ignoreHttpErrors(true)
                            .execute();
                        if (pastConn.statusCode() !== 200) {
                            continue;
                        }
                        var pastResp = pastConn.body();
                        var pastData = JSON.parse(pastResp);
                        if (pastData && pastData.item_equipment && !hasDropMesoOption(pastData)) {
                            equipData = pastData;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            // 결과 포맷팅
            var result = [];
            var foundItem = false;

            var charName = decodeURIComponent(characterName);
            if (slotFilter) {
                // 특정 부위만 조회
                result.push("[" + charName + "] " + slotFilter + " 정보");
                result.push("================================");
            } else {
                // 전체 조회
                result.push("[" + charName + "] 장비 정보");
                result.push("================================");
            }

            if (equipData.item_equipment && equipData.item_equipment.length > 0) {
                for (var i = 0; i < equipData.item_equipment.length; i++) {
                    var item = equipData.item_equipment[i];

                    // 부위 필터링
                    if (slotFilter && item.item_equipment_part.indexOf(slotFilter) === -1) {
                        continue;
                    }

                    foundItem = true;
                    result.push("[" + item.item_equipment_part + "] " + item.item_name);
                    result.push("  스타포스: " + (item.starforce || "0"));

                    if (item.potential_option_grade) {
                        result.push("  잠재: " + item.potential_option_grade);
                        if (item.potential_option_1) result.push("    - " + item.potential_option_1);
                        if (item.potential_option_2) result.push("    - " + item.potential_option_2);
                        if (item.potential_option_3) result.push("    - " + item.potential_option_3);
                    }

                    if (item.additional_potential_option_grade) {
                        result.push("  에디: " + item.additional_potential_option_grade);
                        if (item.additional_potential_option_1) result.push("    - " + item.additional_potential_option_1);
                        if (item.additional_potential_option_2) result.push("    - " + item.additional_potential_option_2);
                        if (item.additional_potential_option_3) result.push("    - " + item.additional_potential_option_3);
                    }
                    result.push("");
                }
            }

            if (slotFilter && !foundItem) {
                result.push("해당 부위를 찾을 수 없습니다.");
            }

            if (!slotFilter && equipData.title && equipData.title.title_name) {
                result.push("칭호: " + equipData.title.title_name);
            }

            replier.reply(result.join("\n"));

        } catch (e) {
            java.lang.System.out.println("[BOT ERROR] 장비 조회: " + e.message);
            replier.reply("장비 조회 오류: " + e.message);
        }
    });
    thread.start();
}

// ===== 스케줄러 기능 (스레드 방식) =====
var schedulerTasks = [
    {
        room: "플로봇 테스트",
        days: [0, 1, 2, 3, 4, 5, 6],
        hour: 16,
        minute: 10,
        message: "플로 바보"
    }
];

var schedulerRunning = false;
var schedulerLastRun = "";

// ==========================================
// 심볼 강화 비용 테이블 (사진 기반)
// ==========================================
// 아케인심볼 한번 필요 성장치 (Lv.1→2 ... Lv.19→20)
var ARCANE_GROWTH_REQ = [12,15,20,27,36,47,60,75,92,111,132,155,180,207,236,267,300,335,372];
// 어센틱 = 그랜드 어센틱 한번 필요 성장치 (Lv.1→2 ... Lv.10→11)
var AUTHENTIC_GROWTH_REQ = [29,76,141,224,325,444,581,746,899,1100];

// 아케인 지역별 메소 비용 (행: Lv.1→2 ... Lv.19→20, 1심볼 기준)
var ARCANE_MESO = {
    "소멸의 여로": [970000,1230000,1660000,2260000,3060000,4040000,5220000,6600000,8180000,9990000,11950000,14260000,16740000,19450000,22420000,25700000,29100000,32830000,36820000],
    "츄츄 아일랜드": [1210000,1540000,2060000,2800000,3790000,5000000,6420000,8100000,10030000,12210000,14430000,17360000,20460000,23560000,26660000,29760000,33680000,37820000,42190000],
    "레헬른": [1450000,1830000,2440000,3330000,4520000,5950000,7650000,9640000,11940000,14430000,16930000,20460000,24180000,27860000,31510000,35150000,40010000,44890000,50050000],
    "아르카나": [1690000,2130000,2830000,3860000,5260000,6910000,8890000,11180000,13860000,16650000,19420000,23560000,27870000,32160000,36380000,40540000,46340000,51960000,57910000],
    "모라스": [1930000,2430000,3220000,4390000,5990000,7860000,10120000,12720000,15770000,18870000,21910000,26660000,31580000,36460000,41250000,45930000,52670000,59030000,65780000],
    "에스페라": [2170000,2720000,3610000,4920000,6720000,8820000,11360000,14260000,17680000,21090000,24410000,29760000,35290000,40760000,46120000,51320000,59000000,66100000,73640000]
};

// 어센틱 지역별 메소 비용 (행: Lv.1→2 ... Lv.10→11, 1심볼 기준)
var AUTHENTIC_MESO = {
    "세르니움": [36500000,91200000,160700000,241900000,331500000,426200000,522900000,618200000,709000000,792000000],
    "아르크스": [41700000,104800000,184100000,276200000,378200000,487200000,597000000,706000000,809200000,904300000],
    "오디움": [46900000,118500000,211500000,318600000,437300000,564400000,691800000,819200000,939800000,1051600000],
    "도원경": [52200000,132200000,237800000,360800000,496900000,642400000,786600000,933100000,1071100000,1198400000],
    "아르테리아": [57400000,145900000,262200000,403200000,565500000,732000000,896000000,1063500000,1219800000,1364000000],
    "카르시온": [62600000,159600000,287600000,443500000,624000000,825800000,1010400000,1207800000,1390700000,1554800000]
};

// 그랜드 어센틱심볼 메소 비용 (행: Lv.1→2 ... Lv.10→11)
var GRAND_AUTHENTIC_MESO = {
    "탈라하트": [113600000,293300000,535800000,837700000,1196000000,1607200000,2068300000,2576000000,3126900000,3718000000],
    "기어드락": [139700000,361700000,662700000,1039300000,1488500000,2006800000,2591200000,3238400000,3945000000,4708000000]
};

// 심볼 1개의 강화 가능 레벨/메소 계산
function calcSymbolUpgrade(currentLevel, currentGrowth, growthReqTable, mesoTable) {
    var levelsUp = 0;
    var totalMeso = 0;
    var growth = currentGrowth;
    while (true) {
        var idx = currentLevel + levelsUp - 1; // 0-indexed: idx=현재레벨-1
        if (idx < 0 || idx >= growthReqTable.length) break;
        var need = growthReqTable[idx];
        if (growth < need) break;
        growth -= need;
        totalMeso += (mesoTable[idx] || 0);
        levelsUp++;
    }
    return { levelsUp: levelsUp, meso: totalMeso, leftoverGrowth: growth };
}

function formatMeso(n) {
    if (n >= 1000000000000) return (n / 1000000000000).toFixed(2) + "조";
    if (n >= 100000000) return (n / 100000000).toFixed(2) + "억";
    if (n >= 10000) return Math.floor(n / 10000) + "만";
    return String(n);
}

// ==========================================
// 심볼 정보 조회 (장착 심볼 정보)
// ==========================================
function getSymbolInfo(characterName, replier) {
    var thread = new java.lang.Thread(function() {
        try {
            // OCID 조회
            var ocidUrl = MAPLE_OCID_API_URL + "?character_name=" + characterName;
            var ocidResp = org.jsoup.Jsoup.connect(ocidUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .timeout(10000)
                .execute()
                .body();
            var ocidData = JSON.parse(ocidResp);

            if (!ocidData || !ocidData.ocid) {
                replier.reply("해당 캐릭터를 찾을 수 없습니다.");
                return;
            }

            // 심볼 정보 조회
            var symbolUrl = MAPLE_SYMBOL_URL + "?ocid=" + ocidData.ocid;
            var symbolResp = org.jsoup.Jsoup.connect(symbolUrl)
                .header("accept", "application/json")
                .header("x-nxopen-api-key", NEXON_API_KEY)
                .ignoreContentType(true)
                .timeout(10000)
                .execute()
                .body();
            var symbolData = JSON.parse(symbolResp);

            var charName = decodeURIComponent(characterName);
            var lines = [];
            lines.push("[" + charName + "] 장착 심볼 정보");
            lines.push("================================");

            if (!symbolData.symbol || symbolData.symbol.length === 0) {
                lines.push("장착된 심볼이 없습니다.");
                replier.reply(lines.join("\n"));
                return;
            }

            // 심볼 종류별 분류 (그랜드 어센틱은 어센틱보다 먼저 체크)
            var arcane = [];
            var authentic = [];
            var grandAuthentic = [];
            var others = [];

            for (var i = 0; i < symbolData.symbol.length; i++) {
                var s = symbolData.symbol[i];
                var name = s.symbol_name || "";
                if (name.indexOf("그랜드 어센틱") !== -1) grandAuthentic.push(s);
                else if (name.indexOf("어센틱") !== -1) authentic.push(s);
                else if (name.indexOf("아케인") !== -1) arcane.push(s);
                else others.push(s);
            }

            var totalUpgradeMeso = 0;

            function getMesoTable(category, region) {
                if (category === "arcane") return ARCANE_MESO[region];
                if (category === "authentic") return AUTHENTIC_MESO[region];
                if (category === "grand") return GRAND_AUTHENTIC_MESO[region];
                return null;
            }

            function appendGroup(title, list, category, growthReqTable) {
                if (list.length === 0) return;
                lines.push("");
                lines.push("◆ " + title + " (" + list.length + "개)");
                var groupMeso = 0;
                var groupLevels = 0;
                for (var j = 0; j < list.length; j++) {
                    var s = list[j];
                    var lvl = s.symbol_level || 0;
                    var growthCnt = s.symbol_growth_count || 0;
                    var growthReq = s.symbol_require_growth_count || 0;
                    var displayName = (s.symbol_name || "")
                        .replace("그랜드 어센틱심볼 : ", "")
                        .replace("아케인심볼 : ", "")
                        .replace("어센틱심볼 : ", "");
                    lines.push("• Lv." + lvl + " " + displayName + " (" + growthCnt + "/" + growthReq + ")");

                    var mesoTable = getMesoTable(category, displayName);
                    if (mesoTable && growthReqTable) {
                        var upg = calcSymbolUpgrade(lvl, growthCnt, growthReqTable, mesoTable);
                        if (upg.levelsUp > 0) {
                            lines.push("   → +" + upg.levelsUp + "Lv 강화 가능, " + formatMeso(upg.meso) + " 메소");
                            groupMeso += upg.meso;
                            groupLevels += upg.levelsUp;
                        }
                    }
                }
                if (groupMeso > 0) {
                    lines.push("  [" + title + " 합계: +" + groupLevels + "Lv, " + formatMeso(groupMeso) + " 메소]");
                    totalUpgradeMeso += groupMeso;
                }
            }

            appendGroup("아케인심볼", arcane, "arcane", ARCANE_GROWTH_REQ);
            appendGroup("어센틱심볼", authentic, "authentic", AUTHENTIC_GROWTH_REQ);
            appendGroup("그랜드 어센틱심볼", grandAuthentic, "grand", AUTHENTIC_GROWTH_REQ);
            appendGroup("기타", others, null, null);

            if (totalUpgradeMeso > 0) {
                lines.push("");
                lines.push("================================");
                lines.push("💰 전체 강화 비용: " + formatMeso(totalUpgradeMeso) + " 메소");
            }

            replier.reply(lines.join("\n"));
        } catch (error) {
            java.lang.System.out.println("[BOT ERROR] getSymbolInfo: " + (error.message || error));
            replier.reply("심볼 정보를 가져올 수 없습니다. 캐릭터명을 확인해주세요.");
        }
    });
    thread.start();
}

// ==========================================
// 추가 기능 함수
// ==========================================
function test(replier) {
    // Paste your direct image link here
    var imageUrl = "https://i.imgur.com/FOS0bu1.jpg"; 
    replier.reply(imageUrl);
}
function getLink(idlink, replier)
{
  replier.reply("https://maplescouter.com/info?name="+idlink);
}
function starforce(chance, count, replier) {
    var success = 0;
    var fail = 0;

    for (var i = 0; i < count; i++) {
        var num = Math.floor(Math.random() * 100);
        if (num < chance) {
            success++;
        } else {
            fail++;
        }
    }

    replier.reply("성공 : "+success+"회\n실패 : "+fail+"회");
}
function clan(replier)
{
  replier.reply("https://maple-boss-site.vercel.app/");
}
function option(replier)
{
    var helpMsg = "📋 [메이플 봇 기능 목록]\n\n";
    helpMsg += "━━━ 캐릭터 조회 ━━━\n";
    helpMsg += "/ㄱㅎㅊ, /경험치, %% [ID]\n";
    helpMsg += "%% [ID] [목표레벨] → 레벨업 예측\n";
    helpMsg += "%%% [ID] → 월간 경험치\n";
    helpMsg += "/ㅌㄹ, /ㅈㅌㄹ, /투력, /전투력, %%%% [ID]\n";
    helpMsg += "/장비, /ㅈㅂ [ID] [부위]\n";
    helpMsg += "/환산 [ID] → 환산 사이트\n";
    helpMsg += "/tmi [ID] → TMI 정보\n\n";
    helpMsg += "━━━ 랭킹 조회 ━━━\n";
    helpMsg += "%% 헤르메스/시계꽃/랭킹/스타\n";
    helpMsg += "%%%% 헤르메스/시계꽃/스타\n\n";
    helpMsg += "━━━ 계산/시뮬 ━━━\n";
    helpMsg += "/6차 [시작] [끝] → 코어 재료\n";
    helpMsg += "/스타, /샤타 [시작] [끝]\n";
    helpMsg += "/확률 [확률] → 시뮬레이션\n";
    helpMsg += "/확률 [확률] [횟수]\n\n";
    helpMsg += "━━━ 길드 정보 ━━━\n";
    helpMsg += "/수로 → 수로 점수표\n";
    helpMsg += "/모집 → 모집 양식\n";
    helpMsg += "/창고, 검은돈 → 길드 창고\n\n";
    helpMsg += "━━━ 벽지 기능 ━━━\n";
    helpMsg += "/벽지 → 벽지 보기\n";
    helpMsg += "/등록 [내용] → 글 등록\n";
    helpMsg += "/삭제 → 내 글 삭제\n\n";
    helpMsg += "━━━ 기타 ━━━\n";
    helpMsg += "/음식 → 음식 추천\n";
    helpMsg += "/코디 → 코디 사이트";
    replier.reply(helpMsg);
}

// ==========================================
// TMI 정보 함수
// ==========================================
function getTmiInfo(characterName, replier) {
  
    var ment=" ";
    if(decodeURIComponent(characterName)=="코코섬")
    {
      ment="tmi창시자";
    }
    else if(decodeURIComponent(characterName)=="덕고미콩")
    {
      ment="길드 마스터\n환산9만대 소마 \n확성기 대량 사용자\n클래식 애청자\n도자기 그림 수집가";
    }
    else if(decodeURIComponent(characterName)=="꿍색")
    {
      ment="보스관련 관리자\n환산9만대 나로 \n수로10만";
    }
    else if(decodeURIComponent(characterName)=="플로렌스")
    {
      ment="재획단 수장\n잠들지 않는자 \n블랙마켓 상인\n플로봇 개발자";
    }
    else if(decodeURIComponent(characterName)=="늘귤")
    {
      ment="길드 창립멤버\n환산9만대 나워 \n수로10만";
    }
    else if(decodeURIComponent(characterName)=="아스티핀")
    {
      ment="36퍼 잠재를 좋아한다\n11월부뒤 군인 \n검은돈 vip";
    }
    else if(decodeURIComponent(characterName)=="렌영v")
    {
      ment="렌1위\n재획단 간부";
    }
    else if(decodeURIComponent(characterName)=="뭘해도우냥")
    {
      ment="수로10만\n9만대 듀블이다";
    }
    else if(decodeURIComponent(characterName)=="영디")
    {
      ment="레벨 1위\n수로10만\n9만대 카인이다.";
    }
    else if(decodeURIComponent(characterName)=="아퐁")
    {
      ment="291렙 비숍\n인사단 수장";
    }
     else if(decodeURIComponent(characterName)=="높푸")
    {
      ment="최초의 재획단\n허리 재활로 장기 휴식중";
    }
     else if(decodeURIComponent(characterName)=="가람님")
    {
      ment="과거 레벨1위 오래유지\n술을 좋아한다";
    }
    
    replier.reply("🏅🏅  "+decodeURIComponent(characterName)+"님의 TMI"+"  🏅🏅\n"+ment+"\n(추가tmi가 있다면 알려주세요)");
}

// ==========================================
// 스케줄러 (Android 앱에서는 비활성화)
// ==========================================
function runScheduler() {
    if (schedulerRunning) return;
    schedulerRunning = true;

    var thread = new java.lang.Thread({
        run: function() {
            while (true) {
                try {
                    var now = new Date();
                    var day = now.getDay();
                    var hour = now.getHours();
                    var minute = now.getMinutes();
                    var currentKey = day + "-" + hour + "-" + minute;

                    if (currentKey !== schedulerLastRun) {
                        for (var i = 0; i < schedulerTasks.length; i++) {
                            var task = schedulerTasks[i];
                            if (task.days.indexOf(day) !== -1 &&
                                task.hour === hour &&
                                task.minute === minute) {
                                Api.sendMessage(task.room, task.message);
                            }
                        }
                        schedulerLastRun = currentKey;
                    }

                    java.lang.Thread.sleep(10000); // 10초마다 체크
                } catch (e) {
                    // 에러 무시하고 계속 실행
                }
            }
        }
    });
    thread.start();
}

// runScheduler();
