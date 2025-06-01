const mainTasks = [
    "蘋果", "香蕉", "西瓜", "番茄", "高麗菜", "洋蔥", "紅蘿蔔", "馬鈴薯", "青椒", "葡萄",
    "雞蛋", "牛肉", "豬肉", "雞肉", "香腸", "火腿", "魚排", "鮭魚", "蝦子", "貝類",
    "汽水", "果汁", "茶飲", "咖啡", "牛奶", "豆漿", "運動飲料", "礦泉水", "啤酒", "紅酒",
    "洋芋片", "巧克力", "餅乾", "糖果", "蛋糕", "冰淇淋", "爆米花", "果凍", "堅果", "餡餅",
    "衛生紙", "洗髮精", "牙膏", "沐浴乳", "洗衣精", "清潔劑", "面紙", "口罩", "洗手乳", "防蚊液"
];

const categories = {
    "蘋果": "蔬菜水果類", "香蕉": "蔬菜水果類", "西瓜": "蔬菜水果類", "番茄": "蔬菜水果類", "高麗菜": "蔬菜水果類",
    "洋蔥": "蔬菜水果類", "紅蘿蔔": "蔬菜水果類", "馬鈴薯": "蔬菜水果類", "青椒": "蔬菜水果類", "葡萄": "蔬菜水果類",
    "雞蛋": "生鮮冷凍類", "牛肉": "生鮮冷凍類", "豬肉": "生鮮冷凍類", "雞肉": "生鮮冷凍類", "香腸": "生鮮冷凍類",
    "火腿": "生鮮冷凍類", "魚排": "生鮮冷凍類", "鮭魚": "海鮮類", "蝦子": "海鮮類", "貝類": "海鮮類",
    "汽水": "飲料類", "果汁": "飲料類", "茶飲": "飲料類", "咖啡": "飲料類", "牛奶": "乳製品",
    "豆漿": "飲料類", "運動飲料": "飲料類", "礦泉水": "飲料類", "啤酒": "飲料類", "紅酒": "飲料類",
    "洋芋片": "零食類", "巧克力": "零食類", "餅乾": "零食類", "糖果": "零食類", "蛋糕": "零食類",
    "冰淇淋": "零食類", "爆米花": "零食類", "果凍": "零食類", "堅果": "零食類", "餡餅": "零食類",
    "衛生紙": "日常用品類", "洗髮精": "日常用品類", "牙膏": "日常用品類", "沐浴乳": "日常用品類", "洗衣精": "家用清潔類",
    "清潔劑": "家用清潔類", "面紙": "日常用品類", "口罩": "日常用品類", "洗手乳": "日常用品類", "防蚊液": "日常用品類"
};

const prospectiveMemory = {
    "洗衣精": { cat: "家用清潔類", key: "Q" },
    "鮮奶": { cat: "乳製品", key: "W" },
    "鮭魚": { cat: "海鮮類", key: "P" }
};

let taskType = 'practice';
let currentIndex = 0;
let timer;
let responseTimes = [];
let correctCount = 0;
let mainCorrect = 0;
let prospectiveCorrect = 0;
let totalStartTime;
let logs = [];
const fixationTimes = [1250, 1500, 1750];
let questionSequence = [];

function getRandomDelay() {
    return fixationTimes[Math.floor(Math.random() * fixationTimes.length)];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateTaskSequence(type) {
    questionSequence = [];
    const isPractice = type === 'practice';
    const total = isPractice ? 66 : 33;
    const prospectiveEach = isPractice ? 2 : 5;

    // 加入固定數量的前瞻性任務
    const prospectiveItems = Object.keys(prospectiveMemory);
    for (const item of prospectiveItems) {
        for (let i = 0; i < prospectiveEach; i++) {
            questionSequence.push({ item, category: prospectiveMemory[item].cat, isProspective: true });
        }
    }

    const remaining = total - questionSequence.length;

    for (let i = 0; i < remaining; i++) {
        const item = mainTasks[Math.floor(Math.random() * mainTasks.length)];
        const trueCat = categories[item];
        const isCorrect = Math.random() < 0.5;
        const wrongCats = Object.values(categories).filter(c => c !== trueCat);
        const cat = isCorrect ? trueCat : wrongCats[Math.floor(Math.random() * wrongCats.length)];
        questionSequence.push({ item, category: cat, isProspective: false });
    }

    shuffleArray(questionSequence);
}

function startTask(type) {
    taskType = type;
    currentIndex = 0;
    responseTimes = [];
    correctCount = 0;
    mainCorrect = 0;
    prospectiveCorrect = 0;
    logs = [];
    totalStartTime = Date.now();

    generateTaskSequence(type);
    document.getElementById("category").textContent = "+";
    document.getElementById("item").textContent = "";

    const delay = getRandomDelay();
    setTimeout(() => {
        document.getElementById("status").textContent = "即將開始...";
        setTimeout(() => nextQuestion(), 2000);
    }, delay);
    document.getElementById("status").textContent = "請注視加號";
}

function nextQuestion() {
    if (currentIndex >= questionSequence.length) {
        endTest();
        return;
    }

    const q = questionSequence[currentIndex];
    const item = q.item;
    const cat = q.category;
    const isProspective = q.isProspective;

    document.getElementById("category").textContent = cat;
    document.getElementById("item").textContent = item;
    document.getElementById("status").textContent = "";

    const start = Date.now();
    let responded = false;

    function keyHandler(e) {
        if (responded) return;
        responded = true;
        document.removeEventListener('keydown', keyHandler);
        clearTimeout(timer);

        let isCorrect = false;
        const key = e.key.toUpperCase();
        if (isProspective) {
            if (key === prospectiveMemory[item].key) {
                isCorrect = true;
                prospectiveCorrect++;
            }
        } else {
            if ((key === 'N' && categories[item] === cat) || (key === 'M' && categories[item] !== cat)) {
                isCorrect = true;
                mainCorrect++;
            }
        }

        if (isCorrect) correctCount++;
        const rt = (Date.now() - start) / 1000;
        responseTimes.push(rt);

        logs.push({ 題號: currentIndex + 1, 題目: item, 類別: cat, 回答: key, 正確與否: isCorrect ? '正確' : '錯誤', 反應時間: rt.toFixed(2) });
        console.log(`第 ${currentIndex + 1} 題：${isCorrect ? '正確' : '錯誤'}`);

        currentIndex++;
        setTimeout(() => nextQuestion(), 1000);
    }

    document.addEventListener('keydown', keyHandler);
    timer = setTimeout(() => {
        if (!responded) {
            document.removeEventListener('keydown', keyHandler);
            responseTimes.push(3);
            logs.push({ 題號: currentIndex + 1, 題目: item, 類別: cat, 回答: '未作答', 正確與否: '錯誤', 反應時間: '3.00' });
            console.log(`第 ${currentIndex + 1} 題：超時`);
            currentIndex++;
            setTimeout(() => nextQuestion(), 1000);
        }
    }, 3000);
}

function endTest() {
    const totalSeconds = (Date.now() - totalStartTime) / 1000;
    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const summary = {
        總正確率: (correctCount / responseTimes.length * 100).toFixed(2) + '%',
        答題平均時間: averageTime.toFixed(2) + '秒',
        總花費秒數: totalSeconds.toFixed(2),
        主任務正確率: (mainCorrect / (responseTimes.length - prospectiveCorrect) * 100).toFixed(2) + '%',
        前瞻性記憶任務正確率: (prospectiveCorrect / (taskType === 'formal' ? 15 : 6) * 100).toFixed(2) + '%'
    };
    console.table(summary);
    logs.push({ ...summary });
    exportToExcel(logs);
    alert("測驗完成，已匯出成 Excel。");
}

function exportToExcel(data) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "測驗結果");
    XLSX.writeFile(wb, `記憶測驗_${taskType}.xlsx`);
}
