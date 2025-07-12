document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  // Обновление счётчика активных свечей
  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
  }

  // Добавить свечку в заданные координаты
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
    updateCandleCount();
  }

  // Клик по торту добавляет свечу
  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  // Проверка, дует ли пользователь (для задувания свечей)
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
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
    }
  }

  // Доступ к микрофону
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

  // Чтение параметров из URL
  const count = parseInt(getParam("candles"));
  const name = getParam("name");

  // Автоматическая расстановка свечей по кругу на верхнем слое торта
  if (!isNaN(count) && count > 0) {
    const layerTop = document.querySelector(".layer-top");
    const rect = layerTop.getBoundingClientRect();
    const cakeRect = cake.getBoundingClientRect();

    const centerX = rect.left - cakeRect.left + rect.width / 2;
    const centerY = rect.top - cakeRect.top + rect.height / 2;
    const radius = 40;

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      addCandle(x, y);
    }
  }

  // Замена заголовка на имя из параметра
  if (name) {
    const titleEl = document.getElementById("title") || document.querySelector("h1");
    if (titleEl) {
      titleEl.textContent = `Happy Birthday, ${name}!`;
    }
  }
});

// Получение параметров из URL
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
