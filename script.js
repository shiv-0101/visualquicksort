let array = [];
let steps = [];
let currentStep = 0;
let autoPlayInterval = null;

const defaultSize = 10;

const container = document.getElementById("array-container");
const generateBtn = document.getElementById("generateBtn");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const speedSlider = document.getElementById("speedSlider");
const userInput = document.getElementById("userInput");

/**
 * This function saves each step of the sorting process so we can replay them later.
 * Think of it like taking a photo of the array at each moment during sorting.
 * We save the current state of the array and any elements that should be highlighted
 * (like the pivot element or the element being compared).
 */
function saveStep(arr, highlight = {}) {
    steps.push({
        array: [...arr],
        highlight: { ...highlight }
    });
}

/**
 * This function displays one specific step of the sorting animation on the screen.
 * It takes a step number and shows what the array looked like at that moment.
 * Each number in the array is drawn as a vertical bar - taller bars represent bigger numbers.
 * Different colors are used to show special elements like the pivot (red) or comparing element (yellow).
 */
function renderStep(index) {
    container.innerHTML = "";
    let step = steps[index];
    if (!step) return;

    let maxVal = Math.max(...step.array);

    step.array.forEach((value, i) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${(value / maxVal) * 300}px`;
        bar.innerText = value;

        if (i === step.highlight.pivot)
            bar.classList.add("pivot");

        if (i === step.highlight.compare)
            bar.classList.add("comparing");

        if (step.highlight.sorted)
            bar.classList.add("sorted");

        container.appendChild(bar);
    });
}

/**
 * This function creates a new array to sort. It can work in two ways:
 * 1. If the user typed numbers in the input box, it uses those numbers
 * 2. If the input box is empty, it generates 10 random numbers between 1-100
 * After creating the array, it runs the sorting algorithm and saves all the steps.
 */
function generateArray() {
    clearInterval(autoPlayInterval);
    steps = [];
    currentStep = 0;

    let input = userInput.value.trim();

    if (input === "") {
        // Generate 10 random numbers
        array = [];
        for (let i = 0; i < defaultSize; i++)
            array.push(Math.floor(Math.random() * 100) + 1);
    } else {
        // Parse user input
        let numbers = input.split(",").map(x => Number(x.trim()));
        if (numbers.some(isNaN)) {
            alert("Enter valid numbers separated by commas.");
            return;
        }
        array = numbers;
    }

    saveStep(array);
    randomizedQuickSort([...array], 0, array.length - 1);
    saveStep(steps[steps.length - 1].array, { sorted: true });

    renderStep(0);
}

/**
 * This is the main sorting algorithm! 
 * 1. Picking a random element as a 'pivot'
 * 2. Moving all smaller numbers to the left of the pivot
 * 3. Moving all bigger numbers to the right of the pivot
 * 4. Repeating this process on the left and right parts until everything is sorted
 * 
 * The 'randomized' part means we pick the pivot randomly instead of always picking
 * the first or last element. This helps avoid worst-case performance.
 */
function randomizedQuickSort(arr, low, high) {
    if (low < high) {
        let pi = randomizedPartition(arr, low, high);
        randomizedQuickSort(arr, low, pi - 1);
        randomizedQuickSort(arr, pi + 1, high);
    }
}

/**
 * This function does the actual work of partitioning (rearranging) the array.
 * It picks a random pivot, then moves all smaller numbers to its left
 * and all larger numbers to its right. This is the core of quick sort!
 */
function randomizedPartition(arr, low, high) {
    // Pick a random element as our pivot point
    let randomIndex = Math.floor(Math.random() * (high - low + 1)) + low;
    saveStep(arr, { pivot: randomIndex });

    // Move our random pivot to the end to make partitioning easier
    [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];

    let pivot = arr[high];  // The pivot value we're comparing against
    let i = low - 1;        // Index of the last element smaller than pivot

    // Go through each element and compare it to the pivot
    for (let j = low; j < high; j++) {
        // Show which element we're currently comparing to the pivot
        saveStep(arr, { pivot: high, compare: j });

        // If this element is smaller than the pivot, move it to the left side
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            saveStep(arr, { pivot: high });
        }
    }

    // Put the pivot in its correct final position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    saveStep(arr);

    // Return the final position of the pivot
    return i + 1;
}
// ========== END OF QUICK SORT ALGORITHM ==========

/**
 * This function automatically plays through all the sorting steps like a movie.
 * It shows one step every few milliseconds based on the speed slider setting.
 * When it reaches the last step, it stops automatically.
 */
function startAutoPlay() {
    clearInterval(autoPlayInterval);

    autoPlayInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            renderStep(currentStep);
        } else {
            clearInterval(autoPlayInterval);
        }
    }, speedSlider.value);
}

/**
 * These are all the button click handlers that respond when users interact with the page.
 * Each button does something different - generate new numbers, start animation, 
 * step forward/backward through the sorting process, or change the speed.
 */
generateBtn.addEventListener("click", generateArray);

startBtn.addEventListener("click", () => {
    currentStep = 0;
    renderStep(currentStep);
    startAutoPlay();
});

nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep(currentStep);
    }
});

prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
    }
});

speedSlider.addEventListener("input", () => {
    if (autoPlayInterval) {
        startAutoPlay();
    }
});

generateArray();
