package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.sql.Blob;

@Entity
@Table(
        name = "file",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"version", "browser"}) // example: composite unique
        }
)
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "file_seq")
    @SequenceGenerator(name = "file_seq", sequenceName = "file_sequence", initialValue = 1, allocationSize = 1)
    private Long id;


    private String fileName;

    private long fileSize;

    private String contentType;

    private String browser;


    private String version;

    public String getBrowser() {
        return browser;
    }

    public void setBrowser(String browser) {
        this.browser = browser;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    @Lob
    @Basic(fetch = FetchType.LAZY) // blob is lazy-loaded
    @JsonIgnore
    private Blob data;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Blob getData() { return data; }
    public void setData(Blob data) { this.data = data; }
}
