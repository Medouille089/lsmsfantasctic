document.getElementById('rapportForm').addEventListener('submit', function (event) {
    event.preventDefault();

    if (!this.checkValidity()) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    downloadPDF();
});

function convertImagesToBase64(callback) {
    const images = document.querySelectorAll("#rapport img");
    let imagesLoaded = 0;

    images.forEach((img) => {
        if (img.src.startsWith("data")) {
            imagesLoaded++;
            if (imagesLoaded === images.length) callback();
            return;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const newImg = new Image();

        newImg.crossOrigin = "Anonymous";
        newImg.src = img.src;

        newImg.onload = () => {
            canvas.width = newImg.width;
            canvas.height = newImg.height;
            ctx.drawImage(newImg, 0, 0);
            img.src = canvas.toDataURL("image/png");

            imagesLoaded++;
            if (imagesLoaded === images.length) callback();
        };

        newImg.onerror = () => {
            console.error("Impossible de charger l'image :", img.src);
            imagesLoaded++;
            if (imagesLoaded === images.length) callback();
        };
    });

    if (images.length === 0) callback();
}

function sendToWebhook(pdfData, fileName) {
    const url = 'https://discord.com/api/webhooks/1357760776269729983/IPMgOJtdl_wP0aBM1KD_UFx1ZYEjmGtTYQnfdJmQkSyGkRGX1P9V4tX75P9qumEz7KuP';

    const byteCharacters = atob(pdfData);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'application/pdf' });
    const numeroDossier = document.getElementById('numeroDossier').value;
    const embed = {
        "embeds": [{
            "title": `RAPPORT D'INTERVENTION - ${numeroDossier}`,
            "color": 16777215,
            "fields": [
                {
                    "name": "**Patient**",
                    "value": `**Nom Prénom**: ${document.querySelector('input[placeholder="Doe John"]').value}\n**N° Dossier**: ${document.querySelector('input[placeholder="INTER0001"]').value}\n**Date de l’intervention**: ${document.querySelector('input[placeholder="JJ/MM/AAAA"]').value}`
                },
                {
                    "name": "**Médecin en charge**",
                    "value": `**Nom Prénom**: ${document.getElementById('medecinsSelect').options[document.getElementById('medecinsSelect').selectedIndex].text}\n**Matricule**: ${document.querySelector('input[placeholder="089"]').value}\n**Grade**: ${document.getElementById('gradeSelect').value}`
                },
                {
                    "name": "**Intervention**",
                    "value": `**Lieu**: ${document.querySelector('input[placeholder="Hôpital Pillbox Hill, Tequilala Vinewood Avenue"]').value}\n**Région**: ${document.getElementById('etat').value}`
                },
            ],
            "footer": {
                "text": "LSMS Assistant",
                "timestamp": new Date().toISOString()
            }
        }]
    };


    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(embed));
    formData.append('file', blob, fileName);

    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error:', error));
}


function downloadPDF() {
    convertImagesToBase64(() => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const rapport = document.getElementById('rapport');

        const numeroDossierInput = document.querySelector('input[placeholder="INTER0001"]');
        const numeroDossier = numeroDossierInput ? numeroDossierInput.value : "INTER";

        const nomPrenomInput = document.getElementById('nomPatient');
        const nomPrenom = nomPrenomInput ? nomPrenomInput.value : "Nom Prénom";

        const fileName = `${numeroDossier} - ${nomPrenom}.pdf`;

        const rapportText = document.querySelector('textarea[placeholder="Décrire l’intervention ici..."]').value;

        const formattedRapportText = rapportText.replace(/\n/g, '<br>');

        const rapportDiv = document.createElement('div');

        rapportDiv.innerHTML = formattedRapportText;

        const rapportTextarea = document.querySelector('textarea[placeholder="Décrire l’intervention ici..."]');

        const applyStyles = (textarea, div) => {
            const styles = window.getComputedStyle(textarea);
            div.style.width = styles.width;
            div.style.height = styles.height;
            div.style.padding = styles.padding;
            div.style.background = styles.background;
            div.style.border = styles.border;
            div.style.borderRadius = styles.borderRadius;
            div.style.fontSize = styles.fontSize;
            div.style.fontFamily = styles.fontFamily;
            div.style.color = styles.color;
            div.style.lineHeight = styles.lineHeight;
            div.style.boxSizing = styles.boxSizing;
            div.style.outline = styles.outline;
            div.style.whiteSpace = 'pre-wrap';
            div.style.resize = 'none';
            div.style.marginTop = '15px';
        };

        applyStyles(rapportTextarea, rapportDiv);

        rapportTextarea.parentNode.replaceChild(rapportDiv, rapportTextarea);

        html2canvas(rapport, { useCORS: true, allowTaint: false })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

                const pdfData = pdf.output('datauristring').split(',')[1];

                sendToWebhook(pdfData, fileName);
            })
            .catch(error => console.error("Erreur lors de la génération du PDF :", error));

        rapportDiv.parentNode.replaceChild(rapportTextarea, rapportDiv);
    });
}

window.onload = async function () {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const date = `${day}/${month}/${year} à ${hours}:${minutes}`;

    document.getElementById('dateInput').value = date;

    await loadMedecinsList();
};

async function loadMedecinsList() {
    const select = document.getElementById('medecinsSelect');
    select.innerHTML = '<option value="">Chargement...</option>';

    try {
        const response = await fetch('members.json');
        const data = await response.json();

        if (data.length === 0) {
            select.innerHTML = '<option value="">Aucun médecin disponible</option>';
        } else {
            select.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Choisissez un médecin';
            select.appendChild(defaultOption);

            data.forEach((medecin) => {
                const option = document.createElement('option');
                option.value = medecin.id;
                option.text = medecin.displayName;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des médecins :", error);
        select.innerHTML = '<option value="">Erreur lors du chargement des médecins</option>';
    }
}

document.getElementById('medecinsSelect').addEventListener('change', function (event) {
    const medecinId = event.target.value;
    console.log("Médecin sélectionné :", medecinId);

    if (medecinId) {
        fetch('members.json')
            .then(response => response.json())
            .then(data => {
                const selectedMedecin = data.find(medecin => medecin.id === medecinId);

                if (selectedMedecin) {
                    document.querySelector('input[placeholder="089"]').value = selectedMedecin.matricule || '';
                    document.getElementById('gradeSelect').value = selectedMedecin.highestRole || '';
                } else {
                    console.error("Médecin non trouvé");
                }
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des informations du médecin :", error);
                alert(`Erreur : ${error.message}`);
            });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const numeroDossierInputs = document.querySelectorAll('input[id="numeroDossier"]');

    numeroDossierInputs.forEach(input => {
        input.addEventListener("input", function () {
            numeroDossierInputs.forEach(otherInput => {
                if (otherInput !== input) {
                    otherInput.value = this.value;
                }
            });
        });
    });
});

document.getElementById('telephoneInput').addEventListener('input', function (event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 10) {
        value = value.slice(0, 10);
    }

    if (value.length <= 3) {
        input.value = `(${value}`;
    } else if (value.length <= 6) {
        input.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
        input.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }

    if (value.length === 0) {
        input.value = '';
    }
});