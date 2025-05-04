import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-marketing-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <h2 class="text-2xl font-bold mb-6 text-green-700">Formulaire de Prédiction Marketing</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-2 gap-4">
        <ng-container *ngFor="let field of fields">
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
            <input
              *ngIf="field.type === 'text'"
              type="text"
              [formControlName]="field.key"
              class="w-full border rounded px-3 py-2"
              [placeholder]="field.placeholder"
            />
            <select
              *ngIf="field.type === 'select'"
              [formControlName]="field.key"
              class="w-full border rounded px-3 py-2"
            >
              <option *ngFor="let option of field.options" [value]="option">{{ option }}</option>
            </select>
          </div>
        </ng-container>

        <div class="col-span-2 mt-4">
          <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Prédire
          </button>
        </div>
      </form>

      <div *ngIf="predictionResult" class="mt-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded">
        <strong>Préférence prédite :</strong> {{ predictionResult }}
      </div>
    </div>
  `,
})
export class PreferencesComponent {
  form: FormGroup;
  predictionResult: string | null = null;

  fields = [
    { key: 'sexe', label: 'Sexe', type: 'select', options: ['Homme', 'Femme'] },
    { key: 'type_peau', label: 'Type de peau', type: 'select', options: ['Grasse', 'Sèche', 'Mixte'] },
    { key: 'type_cheveux', label: 'Type de cheveux', type: 'select', options: ['Gras', 'Sec', 'Normal'] },
    { key: 'marque_tunisiennes_conn', label: 'Connaissance des marques tunisiennes', type: 'select', options: ['Oui', 'Non'] },
    { key: 'marque_tunisiennes_util', label: 'Utilisation des marques tunisiennes', type: 'select', options: ['Oui', 'Non'] },
    { key: 'pref_internationale', label: 'Préférence internationale', type: 'select', options: ['Oui', 'Non'] },
    { key: 'local_VS_inter', label: 'Local vs International', type: 'select', options: ['Local', 'International'] },
    { key: 'type_achat', label: 'Type d\'achat', type: 'select', options: ['En ligne', 'Magasin'] },
    { key: 'critere_achat', label: 'Critère d\'achat', type: 'select', options: ['Prix', 'Qualité', 'Marque'] },
    { key: 'canal_achat', label: 'Canal d\'achat', type: 'text', placeholder: 'ex: Site web' },
    { key: 'interet_app', label: 'Intérêt pour l\'application', type: 'select', options: ['Oui', 'Non'] },
    { key: 'profession', label: 'Profession', type: 'text', placeholder: 'ex: Ingénieur' },
    { key: 'secteur', label: 'Secteur', type: 'text', placeholder: 'ex: IT' },
    { key: 'region', label: 'Région', type: 'text', placeholder: 'ex: Tunis' },
    { key: 'interet_rec', label: 'Intérêt pour les recommandations', type: 'select', options: ['Oui', 'Non'] },
    { key: 'objectif_cos', label: 'Objectif cosmétique', type: 'text', placeholder: 'ex: Hydratation' },
    { key: 'probleme_peau', label: 'Problème de peau', type: 'text', placeholder: 'ex: Acné' },
    { key: 'ingredients_eviter', label: 'Ingrédients à éviter', type: 'text', placeholder: 'ex: Parabènes' },
    { key: 'age', label: 'Tranche d\'âge', type: 'select', options: ['18 - 24 ans', '25 - 34 ans', '35 - 44 ans', '45 - 54 ans', '55 - 64 ans', '65 ans et plus'] },
    { key: 'budget', label: 'Budget (TND)', type: 'text', placeholder: 'ex: 100' },
    { key: 'salaire', label: 'Salaire', type: 'select', options: ['Moins de 1 000 TND', 'De 1 000 à 2 000 TND', 'De 2 000 à 3 000 TND', 'De 3 000 à 4 000 TND', 'De 4 000 à 5 000 TND', 'Plus de 5 000 TND'] },
    { key: 'frequence_app', label: 'Fréquence d\'utilisation', type: 'select', options: ['Jamais', 'Occasionnellement', 'Fréquemment', 'Très fréquemment'] },
    { key: 'temp_moy_achat', label: 'Temps moyen d\'achat', type: 'select', options: ['Moins de 5 minutes', 'De 5 à 10 minutes', 'De 10 à 15 minutes', 'Plus de 15 minutes'] },
    { key: 'niveau_fidelite', label: 'Niveau de fidélité', type: 'select', options: ['Pas du tout fidèle', 'Fidèle de temps en temps', 'Modérément fidèle', 'Très fidèle : j’achète toujours les mêmes marques'] }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    const controls = this.fields.reduce((acc, field) => {
      acc[field.key] = this.fb.control('', Validators.required);
      return acc;
    }, {} as { [key: string]: any });

    this.form = this.fb.group(controls);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload = this.form.value;

    this.http.post<{ prediction: string }>('http://localhost:5000/marketing/predict_preference', payload)
      .subscribe({
        next: res => this.predictionResult = res.prediction,
        error: err => {
          console.error('Erreur lors de la prédiction', err);
          this.predictionResult = 'Erreur lors de la prédiction.';
        }
      });
  }
}
