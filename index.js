import express from "express";
import axios from "axios";

const app = express();

const windowSize = 10;
let windowPrevState = [];
let windowCurrState = [];

//  function to fetch numbers from a third-party API
// can also use the fetch api call, for the purpose i've used axios
async function fetchNumbers(numberId) {
  try {
    const response = await axios.get(`http://localhost:8080/numbers/${numberId}`, {
      timeout: 500,
    });
    return response.data.numbers;
  } catch (error) {
    console.error("Error in fetching numbers:", error.message);
    return [];
  }
}

// function to calculate the average of an array
function calculateAverage(numbers) {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

// Route to handle fetching and averaging numbers
app.get("/numbers/:numberId", async (req, res) => {
  const numberId = req.params.numberId;
  try {
    // Validating numberId
    if (!["p", "f", "e", "r"].includes(numberId)) {
      return res.status(400).json({ error: "Invalid number ID" });
    }

    // Fetch numbers from the third-party API
    const newNumbers = await fetchNumbers(numberId);
    
    // for practice purpose
    async function fetchNumbers(numberId){
      return new Promise((resolve) => {
        setTimeout(() => {
            if (numberId === 'p') resolve([2, 3, 5, 7]);
            else if (numberId === 'f') resolve([1, 1, 2, 3, 5, 8]);
            else if (numberId === 'e') resolve([2, 4, 6, 8]);
            else if (numberId === 'r') resolve([12, 34, 56, 78]);
        }, 100);
    });
    } 

    // Filter out duplicates and add new numbers to the current state
    const uniqueNumbers = newNumbers.filter(
      (num) => !windowCurrState.includes(num)
    );
    windowPrevState = [...windowCurrState];
    windowCurrState = [...windowCurrState, ...uniqueNumbers];

    // Limit the window size
    if (windowCurrState.length > windowSize) {
      windowCurrState = windowCurrState.slice(
        windowCurrState.length - windowSize
      );
    }

    // Calculate the average of the current state
    const avg = calculateAverage(windowCurrState);

    // Respond with the required data
    res.json({
      windowPrevState,
      windowCurrState,
      numbers: newNumbers,
      avg,
    });
  } catch (error) {
    res.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });
  }
});

const port = 8080 || process.env.PORT;

// invoking the server
app.listen(port, () => {
  console.log(
    `Average calculator microservice listening at http://localhost:${port}`
  );
});
