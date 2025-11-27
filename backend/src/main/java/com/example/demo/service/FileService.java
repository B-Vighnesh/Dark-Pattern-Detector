package com.example.demo.service;

import com.example.demo.model.File;
import com.example.demo.repository.FileRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.sql.rowset.serial.SerialBlob;

@Service
public class FileService {

    private final FileRepository fileRepository;

    public FileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    // Store file
    public Long storeFile(MultipartFile multipartFile,String browser,String version) throws IOException {
        try {
            System.out.println("Uploading file: " + multipartFile.getOriginalFilename()
                    + ", size=" + multipartFile.getSize()
                    + ", type=" + multipartFile.getContentType());



            File file = new File();
            file.setBrowser(browser);
            file.setVersion(version);
            file.setFileName(multipartFile.getOriginalFilename());
            file.setFileSize(multipartFile.getSize());
            file.setContentType(multipartFile.getContentType() != null ? multipartFile.getContentType() : "application/octet-stream");

            // Convert byte[] to Blob
            Blob blob = new SerialBlob(multipartFile.getBytes());
            file.setData(blob);

           File savedFile= fileRepository.save(file);
            return savedFile.getId();
        } catch (Exception e) {
            throw new IOException("Failed to store file", e);
        }
    }

    // Retrieve file
    public ResponseEntity<byte[]> getFile(Long fileId) throws Exception{
        Optional<File> fileOptional =fileRepository.findById(fileId);

        if (fileOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        File file = fileOptional.get();

        // Convert Blob to byte[] safely
        byte[] data;
        try (InputStream is = file.getData().getBinaryStream();
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {

            int nRead;
            byte[] tmp = new byte[4096];
            while ((nRead = is.read(tmp, 0, tmp.length)) != -1) {
                buffer.write(tmp, 0, nRead);
            }
            buffer.flush();
            data = buffer.toByteArray();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .body(data);

    }

    public ResponseEntity<List<File>> getFiles() throws Exception{
        List<File> fileOptional =fileRepository.findAll();


        if (fileOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

   return ResponseEntity.ok(fileOptional);

    }

    public ResponseEntity<Long> deleteFile(Long id) {
        Optional<File> optionalFile=fileRepository.findById(id);
        if(optionalFile.isEmpty())
        {
            return new ResponseEntity<>(null,HttpStatus.NOT_FOUND);
        }
        fileRepository.deleteById(id);
        return new ResponseEntity<>(id,HttpStatus.OK);
    }

    public ResponseEntity<List<String>> getVersionsEdge() {
        return ResponseEntity.ok(fileRepository.getVersions("edge"));
    }
    public ResponseEntity<List<String>> getVersionsChrome() {
        return ResponseEntity.ok(fileRepository.getVersions("chrome"));
    }
    public ResponseEntity<List<String>> getVersionsFirefox() {
        return ResponseEntity.ok(fileRepository.getVersions("firefox"));
    }

    public ResponseEntity<byte[]> getExtension(String browser, String version) throws IOException {
        Optional<File> fileOptional =fileRepository.findByBrowserAndVersion(browser,version);

        if (fileOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        File file = fileOptional.get();

        // Convert Blob to byte[] safely
        byte[] data;
        try (InputStream is = file.getData().getBinaryStream();
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {

            int nRead;
            byte[] tmp = new byte[4096];
            while ((nRead = is.read(tmp, 0, tmp.length)) != -1) {
                buffer.write(tmp, 0, nRead);
            }
            buffer.flush();
            data = buffer.toByteArray();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .body(data);
    }

    public ResponseEntity<List<String>> getVersions(String browser) {
        return ResponseEntity.ok(fileRepository.getVersions(browser));
    }
}
