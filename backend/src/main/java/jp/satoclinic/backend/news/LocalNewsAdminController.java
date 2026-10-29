package jp.satoclinic.backend.news;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@Profile("local")
@RestController
@RequestMapping("/api/admin/news")
public class LocalNewsAdminController {
    private final NewsService newsService;

    public LocalNewsAdminController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping
    public List<NewsItem> listAllNews() {
        return newsService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsItem> getNews(@PathVariable String id) {
        NewsItem item = newsService.findById(id);
        return item == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(item);
    }

    @PostMapping
    public ResponseEntity<NewsItem> createNews(@Valid @RequestBody NewsRequest request, UriComponentsBuilder uriBuilder) {
        NewsItem created = newsService.create(request);
        URI location = uriBuilder.path("/api/admin/news/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsItem> updateNews(
            @PathVariable String id,
            @Valid @RequestBody NewsRequest request
    ) {
        NewsItem updated = newsService.update(id, request);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable String id) {
        return newsService.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
