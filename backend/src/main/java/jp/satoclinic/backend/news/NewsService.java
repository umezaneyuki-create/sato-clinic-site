package jp.satoclinic.backend.news;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class NewsService {
    private final NewsMapper mapper;

    public NewsService(NewsMapper mapper) {
        this.mapper = mapper;
    }

    public List<NewsItem> findPublic() {
        return mapper.findPublic();
    }

    public List<NewsItem> findAll() {
        return mapper.findAll();
    }

    public NewsItem findById(String id) {
        return mapper.findById(id);
    }

    public NewsItem create(NewsRequest request) {
        NewsItem item = fromRequest(request);
        item.setId(UUID.randomUUID().toString());
        mapper.insert(item);
        return mapper.findById(item.getId());
    }

    public NewsItem update(String id, NewsRequest request) {
        if (mapper.findById(id) == null) return null;
        NewsItem item = fromRequest(request);
        item.setId(id);
        mapper.update(item);
        return mapper.findById(id);
    }

    public boolean delete(String id) {
        return mapper.deleteById(id) > 0;
    }

    private NewsItem fromRequest(NewsRequest request) {
        NewsItem item = new NewsItem();
        item.setTitle(request.title().trim());
        item.setBody(request.body().trim());
        item.setCategory(request.category().trim());
        item.setDate(request.date());
        item.setStatus(request.status());
        item.setRelatedUrl(blankToNull(request.relatedUrl()));
        item.setThumbnailPath(blankToNull(request.thumbnailPath()));
        return item;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
