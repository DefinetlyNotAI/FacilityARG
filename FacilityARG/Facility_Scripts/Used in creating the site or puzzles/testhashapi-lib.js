const checkKeyword = async (keyword, number) => {
    const res = await fetch('http://localhost:3000/api/keyword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, number }),
    });
    const data = await res.json();
    return !!data.match;
};

const tests = [
    {
        label: "❌ Test 1: Wrong Keyword",
        keyword: "totallywrong",
        number: 1,
    },
    {
        label: "⚠️ Test 2: Correct Keyword, Wrong Index",
        keyword: "unbirth",
        number: 5,
    },
    {
        label: "✅ Test 3a: Correct Keyword, Correct Index",
        keyword: "unbirth",
        number: 6,
    },
    {
        label: "✅ Test 3b: Correct Keyword, Correct Index (mixed caps)",
        keyword: "uNbIrtH",
        number: 6,
    },
];

async function runTests() {
    for (const test of tests) {
        const match = await checkKeyword(test.keyword, test.number);
        console.log(`${test.label} → match: ${match}`);
    }
}

await runTests();
