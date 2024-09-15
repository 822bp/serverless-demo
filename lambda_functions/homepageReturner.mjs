export const handler = async (event) => {
    const home = () => {
      return `
      <!DOCTYPE html>
      <html>
          <h1>
              Willkommen zur Steuererklaerung
          </h1>
          <p>
              Lade deine Datei hoch, um deine Steuererklaerungs-ID zu bekommen:
          </p>
          <form id="uploadForm" enctype="multipart/form-data">
              <input type="file" id="fileInput" accept=".json" required>
              <button type="submit">Hochladen</button>
          </form>
  
          <script>
              document.getElementById('uploadForm').addEventListener('submit', function(e) {
                  e.preventDefault();
                  
                  const fileInput = document.getElementById('fileInput');
                  const file = fileInput.files[0];
      
                  fetch('http://localhost/upload', {
                      method: 'POST',
                      body: file,
                  })
                  .then(response => response.json())
                  .then(data => {
                      alert('Upload erfolgreich: ' + JSON.stringify(data));
                      window.location.href = "http://localhost/result?result=" + data;
                  })
                  .catch(error => {
                      console.error('Fehler beim Hochladen:', error);
                      alert('Fehler beim Hochladen');
                  });
              });
          </script>
      </html>
      `;
  }
    const response = {
      statusCode: 200,
      headers: {
          'Content-Type': 'text/html',
      },
      body: home()
    };
    return response;
  };

  
/*
  There are better ways to return a homepage serverless.
  Streaming directly from an S3 bucket is such a way.
*/