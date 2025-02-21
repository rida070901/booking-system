import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserDto } from '../../../shared/models/dto/user.dto';

@Component({
  selector: 'app-user-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  destroyRef = inject(DestroyRef);
  sanitizer = inject(DomSanitizer);

  private userId = this.authService.getUserId() ? this.authService.getUserId() : '';
  isLoading = true;
  user: User = {id: '', firstName: '', lastName: '', email: '', phoneNumber: '', role: '' };
  profileImage: string | ArrayBuffer | null = 'assets/default-profile.png';

  userForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required])
  });

  ngOnInit() {
    this.fetchUser();
  }

  private fetchUser() {
    this.userService.getUserById(this.userId!).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.user = data;
        this.userForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber
        });
      },
      error: (err: Error) => console.error(err),
      complete: () => (this.isLoading = false)
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    this.isLoading = true;
    const updatedUser: UserDto = {
      ...this.user,
      ...this.userForm.getRawValue()
    };
    this.onEdit(this.userId!, updatedUser);
  }

  onEdit(id: string, user: UserDto) {
    this.userService.updateUser(id, user).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => this.fetchUser(), // Refresh user data
      error: (err) => console.error('Update failed:', err),
      complete: () => (this.isLoading = false)
    });
  }

  // onEdit(field: keyof User) {
  //   if (this.userForm.get(field)?.invalid) return;
  //   const updatedUser: User = { [field]: this.userForm.get(field)?.value };
  //   const sub = this.userService.updateUser(this.user.id!, { ...this.user, ...updatedUser }).subscribe(() => {
  //     this.fetchUser();
  //   });
  //   this.destroyRef.onDestroy(() => sub.unsubscribe());
  // }

  // onProfilePicChange(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       //this.user.image = reader.result as string; // update preview
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

}
