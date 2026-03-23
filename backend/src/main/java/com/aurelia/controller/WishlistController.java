package com.aurelia.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aurelia.dto.WishlistItemResponseDto;
import com.aurelia.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
@PreAuthorize("hasRole('CUSTOMER')")
public class WishlistController {

	private final WishlistService wishlistService;

	public WishlistController(WishlistService wishlistService) {
		this.wishlistService = wishlistService;
	}

	@GetMapping
	public List<WishlistItemResponseDto> getWishlist(Authentication authentication) {
		return wishlistService.getWishlist(authentication.getName());
	}

	@PostMapping("/{bookId}")
	@ResponseStatus(HttpStatus.CREATED)
	public WishlistItemResponseDto addToWishlist(
		@PathVariable Long bookId,
		Authentication authentication
	) {
		return wishlistService.addToWishlist(authentication.getName(), bookId);
	}

	@DeleteMapping("/{bookId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void removeFromWishlist(@PathVariable Long bookId, Authentication authentication) {
		wishlistService.removeFromWishlist(authentication.getName(), bookId);
	}
}
