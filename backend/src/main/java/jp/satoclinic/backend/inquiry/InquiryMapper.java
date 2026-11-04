package jp.satoclinic.backend.inquiry;

import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface InquiryMapper {
    String COLUMNS = "i.id, i.received_at, i.name, i.email, i.phone, i.category, i.subject, i.content, "
            + "i.status, i.deleted_at, EXISTS(SELECT 1 FROM inquiry_replies r WHERE r.inquiry_id=i.id AND r.status='送信済み') AS replied";

    @Select("<script>SELECT " + COLUMNS + " FROM inquiries i WHERE "
            + "<choose><when test='view == \"deleted\"'>i.deleted_at IS NOT NULL</when>"
            + "<when test='view == \"sent\"'>i.deleted_at IS NULL AND EXISTS(SELECT 1 FROM inquiry_replies r WHERE r.inquiry_id=i.id AND r.status='送信済み')</when>"
            + "<otherwise>i.deleted_at IS NULL</otherwise></choose> ORDER BY i.received_at DESC</script>")
    List<InquiryItem> findAll(@Param("view") String view);

    @Select("SELECT " + COLUMNS + " FROM inquiries i WHERE i.id=#{id}")
    InquiryItem findById(@Param("id") String id);

    @Select("SELECT id, inquiry_id, subject, content, status, sent_at, created_at FROM inquiry_replies "
            + "WHERE inquiry_id=#{inquiryId} ORDER BY created_at DESC")
    List<InquiryReply> findReplies(@Param("inquiryId") String inquiryId);

    @Select("SELECT r.id, r.inquiry_id, r.subject, r.content, r.status, r.sent_at, r.created_at, "
            + "i.received_at, i.name, i.email, i.category FROM inquiry_replies r "
            + "JOIN inquiries i ON i.id=r.inquiry_id WHERE r.status='送信済み' AND i.deleted_at IS NULL "
            + "ORDER BY r.sent_at DESC")
    List<InquiryReply> findSentReplies();

    @Select("SELECT r.id, r.inquiry_id, r.subject, r.content, r.status, r.sent_at, r.created_at, "
            + "i.received_at, i.name, i.email, i.category FROM inquiry_replies r "
            + "JOIN inquiries i ON i.id=r.inquiry_id WHERE r.status='下書き' AND i.deleted_at IS NULL "
            + "ORDER BY r.created_at DESC")
    List<InquiryReply> findDraftReplies();

    @Insert("INSERT INTO inquiries (id,name,email,phone,category,subject,content,status) "
            + "VALUES (#{item.id},#{item.name},#{item.email},#{item.phone},#{item.category},#{item.subject},#{item.content},'未対応')")
    int insert(@Param("item") InquiryItem item);

    @Update("UPDATE inquiries SET status=#{status} WHERE id=#{id} AND deleted_at IS NULL")
    int updateStatus(@Param("id") String id, @Param("status") String status);

    @Update("UPDATE inquiries SET deleted_at=CURRENT_TIMESTAMP WHERE id=#{id} AND deleted_at IS NULL")
    int softDelete(@Param("id") String id);

    @Update("UPDATE inquiries SET deleted_at=NULL WHERE id=#{id} AND deleted_at IS NOT NULL")
    int restore(@Param("id") String id);

    @Delete("DELETE FROM inquiries WHERE id=#{id} AND deleted_at IS NOT NULL")
    int permanentlyDelete(@Param("id") String id);

    @Insert("INSERT INTO inquiry_replies (id,inquiry_id,subject,content,status,sent_at) "
            + "VALUES (#{reply.id},#{reply.inquiryId},#{reply.subject},#{reply.content},#{reply.status},#{reply.sentAt})")
    int insertReply(@Param("reply") InquiryReply reply);

    @Update("UPDATE inquiry_replies SET subject=#{reply.subject},content=#{reply.content},status=#{reply.status},sent_at=#{reply.sentAt} WHERE id=#{reply.id}")
    int updateReply(@Param("reply") InquiryReply reply);

    @Select("SELECT id, inquiry_id, subject, content, status, sent_at, created_at FROM inquiry_replies WHERE id=#{id} AND inquiry_id=#{inquiryId}")
    InquiryReply findReply(@Param("id") String id, @Param("inquiryId") String inquiryId);
}
