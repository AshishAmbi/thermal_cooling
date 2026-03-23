import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCdVgEpqv_bW30u-FcIl0EivlLoKZHhZ-M",
    authDomain: "thermal-cooling.firebaseapp.com",
    databaseURL: "https://thermal-cooling-default-rtdb.firebaseio.com",
    projectId: "thermal-cooling",
    storageBucket: "thermal-cooling.firebasestorage.app",
    messagingSenderId: "364092061462",
    appId: "1:364092061462:web:f23ccdf105566029d5c237"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let temp = 30;
let threshold = 40;
let systemActive = false;
let timeIndex = 0;

// Splash Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash');
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 800);
    }, 3000);
});

// Chart.js Setup
const ctx = document.getElementById('chart').getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 150);
gradient.addColorStop(0, "rgba(0, 212, 255, 0.4)");
gradient.addColorStop(1, "rgba(0, 212, 255, 0.02)");

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            borderColor: "#00D4FF",
            backgroundColor: gradient,
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: false },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' }, min: 10, max: 65 }
        },
        plugins: { legend: { display: false } }
    }
});

// Threshold Input
document.getElementById("threshold").oninput = (e) => {
    threshold = Number(e.target.value);
    document.getElementById("thVal").innerText = threshold;
    updateUI(); 
};

function updateUI() {
    // 1. Corrected Alert Logic
    const alertBox = document.getElementById("alertCard");
    const alertText = document.getElementById("alertText");
    const alertSub = document.getElementById("alertSub");

    if (temp >= threshold + 5) {
        alertText.innerText = "🔥 CRITICAL OVERHEAT";
        alertSub.innerText = "Immediate cooling required";
        alertBox.className = "panel alert danger";
    } 
    else if (temp > threshold) {
        alertText.innerText = "⚠️ HIGH TEMPERATURE";
        alertSub.innerText = "Approaching safety limit";
        alertBox.className = "panel alert warning";
    } 
    else {
        alertText.innerText = "System Stable";
        alertSub.innerText = "All parameters normal";
        alertBox.className = "panel alert safe";
    }

    // 2. Gauge UI Update
    let degree = (temp / 60) * 360;
    // Color also follows the logic
    let color = temp > threshold + 5 ? "#FF3B30" : temp > threshold ? "#FFC107" : "#00FF9C";

    const gauge = document.querySelector(".gauge");
    gauge.style.background = `conic-gradient(${color} ${degree}deg, rgba(255,255,255,0.05) ${degree}deg)`;
    gauge.style.boxShadow = `0 0 30px ${color}33`;
    document.getElementById("tempValue").innerText = temp;

    // 3. Status & Fan
    const status = document.getElementById("systemStatus");
    const fan = document.getElementById("fan");
    status.innerText = systemActive ? "ACTIVE" : "INACTIVE";
    status.className = systemActive ? "active" : "inactive";
    systemActive ? fan.classList.add("spin") : fan.classList.remove("spin");

    // 4. Chart Update
    chart.data.labels.push(timeIndex++);
    chart.data.datasets[0].data.push(temp);
    if (chart.data.labels.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update('none');
}

// Firebase Connection
onValue(ref(db, "thermal"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        temp = data.temperature;
        systemActive = data.system_status === "on";
        updateUI();
    }
});