package com.example.demo.repository;

import com.example.demo.model.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {
    @Query("select max(f.id) from File f")
    Long getMaxid();

    @Query("select f.version from File f where f.browser=:browser")
    List<String> getVersions(@Param("browser") String browser);

    Optional<File> findByBrowserAndVersion(String browser, String version);
}
