package com.aurelia.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.aurelia.model.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

	@EntityGraph(attributePaths = "category")
	@Query("""
		select book
		from Book book
		where (
			:searchTerm = ''
			or lower(book.title) like lower(concat('%', :searchTerm, '%'))
			or lower(book.author) like lower(concat('%', :searchTerm, '%'))
			or lower(coalesce(book.description, '')) like lower(concat('%', :searchTerm, '%'))
		)
		and (:categoryId is null or book.category.id = :categoryId)
		and (:inStockOnly = false or book.stockQuantity > 0)
		""")
	Page<Book> searchCatalog(
		@Param("searchTerm") String searchTerm,
		@Param("categoryId") Long categoryId,
		@Param("inStockOnly") boolean inStockOnly,
		Pageable pageable
	);

	@EntityGraph(attributePaths = "category")
	Optional<Book> findWithCategoryById(Long id);

	@EntityGraph(attributePaths = "category")
	List<Book> findAllByIdIn(Collection<Long> ids);

	boolean existsByIsbn(String isbn);

	boolean existsByIsbnAndIdNot(String isbn, Long id);
}
