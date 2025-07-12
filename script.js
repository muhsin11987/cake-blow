document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  // Координаты стартовых свечей
  const candlePositions = [
    [42.5, 6.5],
    [59.5, 22.5],
    [89.5, 5.5],
    [102.5, 54.5],
    [131.5, 13.5],
    [148.5, 43.5],
    [174.5, 13.5],
    [200.5, 17.5],
    [224.5, 26.5],
    [185.5, 49.5],
    [65.5, 47.5],
    [32.5, 24.5],
    [149.5, 0.5],
    [110.5, -0.5],
    [112.5, 35.5],
    [80.5, 37.5],
    [143.5, 57.5]
  ];

  // Функция для создания свечи
  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
  }

  // Добавить свечи по координатам при загрузке
  candlePositions.forEach(([x, y]) => addCandle(x, y));

  // Добавление свечи при клике
  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  // Проверка, дует ли пользователь
  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }

    let average = sum / bufferLength;
    return average > 40;
  }

  // Задувание свечей
  function blowOutCandles() {
    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
        }
      });
    }
  }

  // Настройка микрофона
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }

  // Задание имени в заголовке, если есть параметр ?name=...
  const name = getParam("name");
  if (name) {
    const titleEl = document.getElementById("title") || document.querySelector("h1");
    if (titleEl) {
      titleEl.textContent = `Happy Birthday, ${name}!`;
    }
  }

  // Получить параметр из URL
  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
});
