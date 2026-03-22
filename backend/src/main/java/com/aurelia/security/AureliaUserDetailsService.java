package com.aurelia.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.aurelia.model.UserRole;
import com.aurelia.repository.UserRepository;

@Service
public class AureliaUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public AureliaUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		com.aurelia.model.User user = userRepository.findByEmail(username)
			.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

		return User.builder()
			.username(user.getEmail())
			.password(user.getPasswordHash())
			.authorities(List.of(toAuthority(user.getRole())))
			.build();
	}

	private SimpleGrantedAuthority toAuthority(UserRole role) {
		return new SimpleGrantedAuthority("ROLE_" + role.name());
	}
}
