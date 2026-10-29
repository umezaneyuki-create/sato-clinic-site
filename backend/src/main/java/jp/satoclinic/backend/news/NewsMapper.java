package jp.satoclinic.backend.news;

import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface NewsMapper {
    String COLUMNS = "id, status, published_at AS date, title, body, category, "
            + "related_url AS relatedUrl, thumbnail_path AS thumbnailPath, "
            + "created_at AS createdAt, updated_at AS updatedAt";

    @Select("SELECT " + COLUMNS + " FROM news WHERE status = '公開' ORDER BY published_at DESC, updated_at DESC")
    List<NewsItem> findPublic();

    @Select("SELECT " + COLUMNS + " FROM news ORDER BY published_at DESC, updated_at DESC")
    List<NewsItem> findAll();

    @Select("SELECT " + COLUMNS + " FROM news WHERE id = #{id}")
    NewsItem findById(@Param("id") String id);

    @Insert("INSERT INTO news (id, status, published_at, title, body, category, related_url, thumbnail_path) "
            + "VALUES (#{item.id}, #{item.status}, #{item.date}, #{item.title}, #{item.body}, #{item.category}, "
            + "#{item.relatedUrl}, #{item.thumbnailPath})")
    int insert(@Param("item") NewsItem item);

    @Update("UPDATE news SET status = #{item.status}, published_at = #{item.date}, title = #{item.title}, "
            + "body = #{item.body}, category = #{item.category}, related_url = #{item.relatedUrl}, "
            + "thumbnail_path = #{item.thumbnailPath} WHERE id = #{item.id}")
    int update(@Param("item") NewsItem item);

    @Delete("DELETE FROM news WHERE id = #{id}")
    int deleteById(@Param("id") String id);
}
