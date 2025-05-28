document.addEventListener('DOMContentLoaded', function() {
    // Elemen UI
    const loginSection = document.getElementById('login-section');
    const inputSection = document.getElementById('input-section');
    const startBtn = document.getElementById('start-btn');
    const backBtn = document.getElementById('back-btn');
    const submitBtn = document.getElementById('submit-btn');
    const subjectSelect = document.getElementById('subject');
    const classSelect = document.getElementById('class');
    const passwordInput = document.getElementById('password');
    const studentsList = document.getElementById('students-list');
    const inputTitle = document.getElementById('input-title');
    const messageDiv = document.getElementById('message');
    
    // Data siswa
    let studentsData = [];
    
    // Password yang valid
    const VALID_PASSWORD = '12345';
    
    // URL Google Apps Script (akan dijelaskan nanti)
    const SCRIPT_URL = 'URL_APPS_SCRIPT_ANDA';
    
    // Event listener untuk tombol Mulai
    startBtn.addEventListener('click', function() {
        const password = passwordInput.value.trim();
        
        if (password !== VALID_PASSWORD) {
            showMessage('Password salah!', 'error');
            return;
        }
        
        loadStudentsData();
    });
    
    // Event listener untuk tombol Kembali
    backBtn.addEventListener('click', function() {
        inputSection.style.display = 'none';
        loginSection.style.display = 'block';
        clearMessage();
    });
    
    // Event listener untuk tombol Simpan Nilai
    submitBtn.addEventListener('click', function() {
        submitScores();
    });
    
    // Fungsi untuk memuat data siswa dari file
    function loadStudentsData() {
        // Dalam implementasi nyata, ini akan diambil dari file siswa.txt
        // Untuk demo, kita gunakan data hardcoded atau fetch dari file
        fetch('siswa.txt')
            .then(response => response.text())
            .then(text => {
                studentsData = parseStudentsData(text);
                const selectedClass = classSelect.value;
                const filteredStudents = studentsData.filter(student => student.class === selectedClass);
                
                if (filteredStudents.length === 0) {
                    showMessage('Tidak ada siswa di kelas ini.', 'error');
                    return;
                }
                
                displayStudentsList(filteredStudents);
                loginSection.style.display = 'none';
                inputSection.style.display = 'block';
                
                const subject = subjectSelect.options[subjectSelect.selectedIndex].text;
                const className = classSelect.options[classSelect.selectedIndex].text;
                inputTitle.textContent = `Input Nilai ${subject} Kelas ${className}`;
            })
            .catch(error => {
                console.error('Error loading students data:', error);
                // Fallback ke data hardcoded jika file tidak bisa di-load
                const fallbackData = `Glory;7a
Rio Rakian;8a
Siti Nurhaliza;7b
Budi Santoso;8a
Ani Wijaya;9b
Citra Dewi;7a
Dodi Pranoto;8b
Eka Surya;9a
Fani Amelia;7b
Guntur Wibowo;8a`;
                
                studentsData = parseStudentsData(fallbackData);
                const selectedClass = classSelect.value;
                const filteredStudents = studentsData.filter(student => student.class === selectedClass);
                
                if (filteredStudents.length === 0) {
                    showMessage('Tidak ada siswa di kelas ini.', 'error');
                    return;
                }
                
                displayStudentsList(filteredStudents);
                loginSection.style.display = 'none';
                inputSection.style.display = 'block';
                
                const subject = subjectSelect.options[subjectSelect.selectedIndex].text;
                const className = classSelect.options[classSelect.selectedIndex].text;
                inputTitle.textContent = `Input Nilai ${subject} Kelas ${className}`;
            });
    }
    
    // Fungsi untuk parsing data siswa dari teks
    function parseStudentsData(text) {
        const lines = text.split('\n');
        return lines
            .map(line => line.trim())
            .filter(line => line)
            .map(line => {
                const [name, class_] = line.split(';');
                return { name, class: class_.toLowerCase() };
            });
    }
    
    // Fungsi untuk menampilkan daftar siswa
    function displayStudentsList(students) {
        studentsList.innerHTML = '';
        
        students.forEach(student => {
            const studentItem = document.createElement('div');
            studentItem.className = 'student-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'student-name';
            nameSpan.textContent = student.name;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'score-input';
            input.min = 0;
            input.max = 100;
            input.placeholder = 'Nilai';
            input.dataset.name = student.name;
            input.dataset.class = student.class;
            
            studentItem.appendChild(nameSpan);
            studentItem.appendChild(input);
            studentsList.appendChild(studentItem);
        });
    }
    
    // Fungsi untuk mengirim nilai ke spreadsheet
    function submitScores() {
        const subject = subjectSelect.value;
        const inputs = document.querySelectorAll('.score-input');
        const scores = [];
        
        inputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                scores.push({
                    name: input.dataset.name,
                    class: input.dataset.class,
                    subject: subject,
                    score: parseInt(value, 10)
                });
            }
        });
        
        if (scores.length === 0) {
            showMessage('Tidak ada nilai yang dimasukkan.', 'error');
            return;
        }
        
        // Kirim data ke Google Apps Script
        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: scores })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Nilai berhasil disimpan!', 'success');
                // Reset input
                inputs.forEach(input => input.value = '');
            } else {
                showMessage('Gagal menyimpan nilai: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Terjadi kesalahan saat menyimpan nilai.', 'error');
        });
    }
    
    // Fungsi untuk menampilkan pesan
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    }
    
    // Fungsi untuk menghapus pesan
    function clearMessage() {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }
});
