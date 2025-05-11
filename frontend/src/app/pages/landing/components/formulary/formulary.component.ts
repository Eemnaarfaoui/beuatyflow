import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-formulary',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './formulary.component.html',
  styleUrls: ['./formulary.component.scss'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class FormularyComponent {
  formData = {
    interet_rec: '',
    objectif_cos: '',
    probleme_peau: '',
    preference_cos: '',
    type_peau: '',
    type_cheveux: '',
    budget: '',
    frequence_app: ''
  };

  successMessage = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.http.post('http://127.0.0.1:5000/api/formulary', this.formData).subscribe({
      next: () => {
        this.successMessage = '✅ Form sent successfully!';
        setTimeout(() => this.successMessage = '', 4000);
        this.formData = {
          interet_rec: '',
          objectif_cos: '',
          probleme_peau: '',
          preference_cos: '',
          type_peau: '',
          type_cheveux: '',
          budget: '',
          frequence_app: ''
        };
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du formulaire :', error);
      }
    });
  }
}
