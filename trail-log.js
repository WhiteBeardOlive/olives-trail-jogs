// Algorithm (steps)
// 1. Create array to store the minutes and seconds
// 2. When we click "Add",
// 3. get the text from the textbox
// 4. Add it to the array

// create an array where we will store objects in the array. Here we need to put a condition if there was an array or object stored in local storage the item must be converted back into a JavaScript Object using JSOON.parse. otherwise create a new array
const jogTime = JSON.parse(localStorage.getItem('jogTime')) || [];

// Render Jog Times
function renderJogTimes() {
  // clear first. prevents old entries from piling up 
  document.querySelector(".js-jog-list").innerHTML = ""

  // sort the dates in chronological order
  jogTime.sort((a, b) => new Date(a.date) - new Date(b.date));

  // string to display the minutes. accumalator
  let joggingMinutes = ''

  // display minutes in console
  for (let i = 0; i < jogTime.length; i++) {
    const jogLogs = jogTime[i]

    
    // format the date so it can display as. October 1, 2025
    let jogDateFormat = new Date(jogLogs.date)
    let formattedDate = jogDateFormat.toLocaleDateString("en-US", {
        year : "numeric",
        month : "long",
        day: "numeric"
      })

    // create html code. use <p> so that each minute starts on a new line. this code here will store the jog time in minutes and seconds. 
    // There will also be a delete button that gets generated with each individual log entry.
    // use splice() method to specifically target which entry to delete. splice takes an index and another number which is how many values should be removed
    joggingMinutes += `
      <p>
        ${formattedDate} min: ${jogLogs.min} sec: ${jogLogs.sec} 
        <button onclick="
          deleteJogEntry(${i});
        ">❌</button>
      </p>
      `
}

  document.querySelector(".js-jog-list").innerHTML = joggingMinutes
}

// Delete Jog Times
function deleteJogEntry(index) {
  jogTime.splice(index, 1)
  // Whenever we update the todo list, save in localStorage. This includes when deleting the list as well
  saveToStorage();
  // render the list again, and newly updated entries
  renderJogTimes()

  // update the chart
  updateJogChart();
}

// Aquire the Jog Times
function addJogTime() {
  // getting an element of the class js-minutes-input and storing in a variable so we can then grab the value from it using a property call value
  const inputElementMinutes = document.querySelector(".js-minutes-input");

  // to get the text or in this case the number out we use a property called value
  // make sure to convert back to a number since value returns a string
  const minutes = Number(inputElementMinutes.value);

  // erase the error on the screen for minutes
  document.querySelector(".js-error-minutes").innerHTML = ""

  // make sure the user enter valid input
  if (minutes < 0) {
    document.querySelector(".js-error-minutes").innerHTML = "Invalid value for minutes. Please enter appropriate value."
    // end the function here
    return
  }

  // same algorithm for seconds
  const inputElementSeconds = document.querySelector(".js-seconds-input");

  // make sure to convert back to a number since value returns a string
  const seconds = Number(inputElementSeconds.value);

  // erase the error on the screen for seconds
  document.querySelector(".js-error-seconds").innerHTML = ""

  if (seconds < 0 || seconds > 59) {
    document.querySelector(".js-error-seconds").innerHTML = "Invalid value for seconds. Please enter appropriate value between 0s - 59s."
    // end the function here
    return
  }

  // getting the date selector element and put it in javascript
  const dateInputElement = document.querySelector(".js-jog-dates-input")

  // get the value from the input 
  const jogDates = dateInputElement.value

  // make sure the user enters a date
  if (!jogDates) {
    alert('Enter a date please')
    return
  }

  // create a new object and put the mintues and seconds
  const logJogObject = {
    min: minutes,
    sec: seconds,
    date: jogDates
  };

  // now push that newly created object into the array
  jogTime.push(logJogObject);

  // value property represents the text in the text box and
  // the value property also returns a string so when getting the numbers they are acutally strings

  // now change the text in the textbox do the following
  inputElementMinutes.value = "";
  inputElementSeconds.value = "";

  // display the jog times
  renderJogTimes();

  // Whenever we update the todo list, save in localStorage.
  saveToStorage();

  // update the chart
  updateJogChart();
}

// function to save in local storage. that way the jog times will not be deleted when page refreshes. Turned the array 'jogTime' into a string since local storage only takes the two arguments as strings.
function saveToStorage() {
  localStorage.setItem('jogTime', JSON.stringify(jogTime))
}
// call the render funtion incase local storage saved jog times they will appear once loaded from storage
renderJogTimes()

updateJogChart(); // <-- ensure chart reflects current state

// helper function prepare the data for the chart.js 
function makeDataPoints(jogTime) {
  // Step 1: Convert each jog entry into an object with x (date) and y (time in decimal minutes)
  const mapped = jogTime.map(j => {
    return {
      x: new Date(j.date),
      y: j.min + j.sec / 60
    };
  });

  // Step 2: Sort the mapped array chronologically by date
  const sorted = mapped.sort((a, b) => a.x - b.x);

  // Step 3: Return the sorted array
  return sorted;
}

// another helper function that refreshes the chart
function updateJogChart() {

  if (jogTime.length === 0) {
  document.querySelector("#jogChart").style.display = "none"; // hides chart
  document.querySelector(".js-no-jog-data").textContent = "No jog data yet. Log your first run!";
  return;
  }

  document.querySelector("#jogChart").style.display = "block";
  document.querySelector(".js-no-jog-data").textContent = "";


  jogChart.data.datasets[0].data = makeDataPoints(jogTime); // get updated points
  jogChart.data.labels = getXAxisLabels(jogTime); // <-- add this
  jogChart.update(); // redraw the chart
}

// using our array for the data on the x axis
function getXAxisLabels(jogTime) {
  // getMonth() + 1 → because months are 0–11 in JS
  // padStart(2, '0') → ensures two digits, e.g., 10/02/2025
  return jogTime
    .map(j => {
      const d = new Date(j.date);
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
    })
    .sort((a, b) => new Date(a) - new Date(b)); // sort chronologically
}


// Code below will deal with our chart graph

const ctx = document.getElementById('jogChart').getContext('2d');

const jogChart = new Chart(ctx, {
  type: 'line', // line chart
  data: {
    labels: [], // x-axis (placeholder for now) ["Day 1", "Day 2", "Day 3"]
    datasets: [{
      label: 'Jog Time (minutes)',
      data: [], // y-axis (placeholder data for now) [13, 11, 9]
      borderColor: 'blue',
      fill: false
    }]
  },
  options: {
    responsive: true
  }
});
