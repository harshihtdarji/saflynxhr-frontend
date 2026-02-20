// Disable browser scroll restoration
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Force scroll to top on load
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

//for search using enter key

let urlInp = document.getElementById("urlInput");
let srcbtn = document.getElementById("src-btn");

urlInp.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    srcbtn.click();
  }
});

srcbtn.addEventListener("click", (e) => {
  scanURL();  //url scan function ne call karyu
});

//url scan function

async function scanURL() {
  const url = document.getElementById("urlInput").value.trim();
  const resultBox = document.getElementById("result");
  const pageLoader = document.getElementById("pageLoader");


  if (url === "") {
    alert("Please enter a URL");
    return;
  }

  document.getElementById("scannedUrl").textContent = url;
  resultBox.classList.add("hidden");

  pageLoader.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // lock scroll


  try {
    // const response = await fetch(
    //   // "https://frederic-rainy-lispily.ngrok-free.dev/check-url",
    //   "https://saflynxhr.onrender.com/check-url",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ url }),
    //   }
    // );

    const response = await fetch(
      "https://saflynxhr.onrender.com/check-url",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );

    const data = await response.json();
    console.log("API Response:", data);

    // ---------------- STATUS ----------------
    let statusText = "";
    let statusColor = "";
    let risk = 0;

    if (data.safe === true) {
      statusText = "✅ Safe";
      statusColor = "#00c853";
      risk = 10;
    } else {
      statusText = "❌ Malicious";
      statusColor = "#ff1744";
      risk = 90;
    }

    document.getElementById("status").textContent = statusText;
    document.getElementById("status").style.color = statusColor;
    document.getElementById("risk").textContent = risk;

    // ---------------- WHOIS ----------------
    handleWhois(data.whois);

    pageLoader.classList.add("hidden");
    document.body.style.overflow = "auto";


    resultBox.classList.remove("hidden");

    resultBox.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {
    console.error("Error scanning URL:", error);
    alert("Failed to scan URL. Is the backend running?");
  }
}

/* WHOIS handler (safe & blocked-aware)*/
function handleWhois(whois) {
  const whoisStatus = document.getElementById("whoisStatus");
  const registrar = document.getElementById("registrar");
  const createdDate = document.getElementById("createdDate");
  const country = document.getElementById("country");

  // Reset
  whoisStatus.textContent = "N/A";
  registrar.textContent = "N/A";
  createdDate.textContent = "N/A";
  country.textContent = "N/A";

  if (!whois || Object.keys(whois).length === 0) {
    whoisStatus.textContent = "No WHOIS data";
    return;
  }

  // Blocked / Protected WHOIS
  if (whois.notice || whois.termsOfUse) {
    whoisStatus.textContent = "Protected / Restricted 🔒";
    return;
  }

  // Real WHOIS data
  whoisStatus.textContent = "Public ✅";
  registrar.textContent =
    whois.registrar || whois.registrarName || "Unknown";
  createdDate.textContent =
    whois.creationDate || whois.createdDate || "Unknown";

  // COUNTRY (WHOIS uses many field names)
  country.textContent =
    whois.country ||
    whois.registrantCountry ||
    whois.adminCountry ||
    whois.techCountry ||
    "Unknown";
}