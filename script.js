// Toggle icon navbar
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

// Memuat status ikon menu dari Local Storage
const isMenuActive = localStorage.getItem('menuActive') === 'true';
if (isMenuActive) {
    menuIcon.classList.add('bx-x');
    navbar.classList.add('active');
}

// Menyimpan status ikon menu ke Local Storage saat diklik
menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
    localStorage.setItem('menuActive', navbar.classList.contains('active'));
};

// Scroll sections
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

// Memuat ID section aktif dari Local Storage
const activeSectionId = localStorage.getItem('activeSectionId');
if (activeSectionId) {
    document.querySelector(`header nav a[href*="${activeSectionId}"]`).classList.add('active');
}

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 100;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            // Active navbar links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            const activeLink = document.querySelector(`header nav a[href*="${id}"]`);
            activeLink.classList.add('active');
            
            // Simpan ID section aktif ke Local Storage
            localStorage.setItem('activeSectionId', id);
            
            // Active sections for animation on scroll
            sec.classList.add('show-animate');
        } else {
            sec.classList.remove('show-animate');
        }
    });

    // Sticky header
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    // Remove toggle icon and navbar when click navbar links (scroll)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');

    // Animation footer on scroll
    let footer = document.querySelector('footer');
    footer.classList.toggle('show-animate', this.innerHeight + this.scrollY >= document.scrollingElement.scrollHeight);
};

// Pendaftaran service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
}

// Fitur install PWA
let deferredPrompt;
const installButton = document.getElementById('install-btn');

// Sembunyikan tombol install secara default
installButton.style.display = 'none';

// Menangani event beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah prompt instalasi ditampilkan secara otomatis
    e.preventDefault();
    // Simpan event untuk digunakan nanti
    deferredPrompt = e;
    // Tampilkan tombol install
    installButton.style.display = 'block';

    // Menangani klik tombol install
    installButton.addEventListener('click', () => {
        // Sembunyikan tombol setelah diklik
        installButton.style.display = 'none';
        // Tampilkan prompt instalasi
        deferredPrompt.prompt();

        // Memeriksa pilihan pengguna
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Pengguna menerima instalasi');
            } else {
                console.log('Pengguna menolak instalasi');
            }
            // Reset deferredPrompt
            deferredPrompt = null;
        });
    });
});




// Inisialisasi IndexedDB
const dbName = "ContactMessages";
const dbVersion = 1;
let db;

// Membuka atau membuat database IndexedDB
const request = indexedDB.open(dbName, dbVersion);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    // Membuat object store jika tidak ada
    if (!db.objectStoreNames.contains("messages")) {
        db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
};

request.onerror = function(event) {
    console.error("Database error:", event.target.errorCode);
};

// Fungsi untuk menyimpan pesan ke IndexedDB
function saveToIndexedDB(data) {
    const transaction = db.transaction("messages", "readwrite");
    const store = transaction.objectStore("messages");
    store.add(data);
    transaction.oncomplete = function() {
        console.log("Pesan berhasil disimpan ke IndexedDB.");
    };
    transaction.onerror = function(event) {
        console.error("Error menyimpan pesan:", event.target.error);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Mencegah reload halaman

        // Mengambil data dari form
        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                Swal.fire({
                    title: "Success!",
                    text: "Message sent successfully!",
                    icon: "success",
                });
                contactForm.reset(); // Reset form setelah submit berhasil
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Failed to send message. Please try again.",
                    icon: "error",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "There was an error sending your message.",
                icon: "error",
            });
        }
    });
});

  