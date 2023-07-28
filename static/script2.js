window.addEventListener('load', function() {
  var introPage = document.getElementById('intro-page');
  var nextButton = document.getElementById('next');
  var container = document.getElementById('container');
  var imageElement = document.getElementById('image');
  var timerElement = document.getElementById('timer');
  var drawingContainer = document.getElementById('drawing-container');
  var canvas = document.getElementById('canvas');
  var blank = document.getElementById('blankCanvas')
  var pen = document.getElementById('pen');
  var eraser = document.getElementById('eraser');
  var deleteButton = document.getElementById('delete');
  var submit = document.getElementById('submit');
  var ctx = canvas.getContext('2d');
  var isDrawing = false;
  var currentTool = 'pen';
  var strokeColor = '#000';
  var strokeWidth = 10;
  var drawingBox = document.getElementById('drawing-box');

  function handleNextButtonClick() {
    introPage.classList.add('slide-up');
    setTimeout(function() {
      introPage.style.display = 'none';
      container.style.opacity = '1';
      showImageAndStartTimer();
    }, 500);
  }

  function showImageAndStartTimer() {
    imageElement.style.display = 'block';
    timerElement.style.display = 'block';
    startTimer(5);
  }

  function startTimer(duration) {
    var timer = duration;
    var minutes;
    var seconds;

    var intervalId = setInterval(function() {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      timerElement.textContent = minutes + ':' + seconds;

      if (--timer < 0) {
        clearInterval(intervalId);
        imageElement.style.display = 'none';
        timerElement.style.display = 'none';
        drawingContainer.style.display = 'block';
        canvas.width = drawingBox.offsetWidth;
        canvas.height = drawingBox.offsetHeight;
        blank.width = canvas.width;
        blank.height = canvas.height;
        showDrawingTools();
      }
    }, 1000);
  }

  function showDrawingTools() {
    var drawingTools = document.getElementById('drawing-tools');
    drawingTools.style.display = 'block';
  }

  function selectPenTool() {
    currentTool = 'pen';
    pen.classList.add('active');
    eraser.classList.remove('active');
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    canvas.style.cursor = 'crosshair';
  }

  function selectEraserTool() {
    currentTool = 'eraser';
    pen.classList.remove('active');
    eraser.classList.add('active');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = strokeWidth * 2;
    canvas.style.cursor = 'crosshair';
  }

  function startDrawing(event) {
    isDrawing = true;
    var rect = canvas.getBoundingClientRect();
    var offsetX = event.clientX - rect.left;
    var offsetY = event.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  }

  function draw(event) {
    if (!isDrawing) return;
    var rect = canvas.getBoundingClientRect();
    var offsetX = event.clientX - rect.left;
    var offsetY = event.clientY - rect.top;
    if (currentTool === 'pen') {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.clearRect(
        offsetX - strokeWidth / 2,
        offsetY - strokeWidth / 2,
        strokeWidth + 2,
        strokeWidth + 2
      );
    }
  }

  function stopDrawing() {
    isDrawing = false;
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function submitDrawing() {
    // Display a confirmation dialog before submitting
    var confirmSubmit = window.confirm('Are you sure you want to submit the drawing?');
  

    if (canvas.toDataURL() == blank.toDataURL()) {
      alert('canvas is empty');
    }
    else {
      // If the user confirms, proceed with the submission
      if (confirmSubmit) {
        var dataURL = canvas.toDataURL(); // Get the drawing as a data URL
        console.log(dataURL); // Add this line to print the data URL to the console

        // Send the drawing data to the server for storage
        fetch('/store_drawing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ drawing: dataURL })
        })
          .then(response => {
            // Check if the submission was successful (you can customize this based on your server response)
            if (response.ok) {
              window.location.href = 'ending'
            } else {
              // Handle unsuccessful submission
              console.log('Submission failed.');
            }
          })
          .catch(error => {
            // Handle submission error
            console.error('Error submitting the drawing:', error);
          });
      } else {
        // If the user cancels, do nothing or provide feedback as needed
        console.log('Submission canceled by the user.');
      }
    }
    }
   

  pen.addEventListener('click', selectPenTool);
  eraser.addEventListener('click', selectEraserTool);
  deleteButton.addEventListener('click', clearCanvas);
  submit.addEventListener('click', submitDrawing);

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  nextButton.addEventListener('click', handleNextButtonClick);

  container.style.opacity = '1';
});
