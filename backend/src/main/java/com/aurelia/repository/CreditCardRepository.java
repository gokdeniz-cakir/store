package com.aurelia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aurelia.model.CreditCard;

public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {

	List<CreditCard> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
