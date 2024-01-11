import { Component } from '@angular/core';
//import { Recipe } from '../models/recipe.model';
import { RecipesService } from '../recipes.service';
import { Observable } from 'rxjs';
import { AuthService } from '../my-service.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent {
 
  filteredRecipes:{ title: string; image: string; description: string; calories: number; dietLabels:string[];saved:boolean,source:string;url:string; servings:number; time:number,healthLabels:string[] }[] = [
  ];
  selectedType:string='All';
  healthTags:string[]=[];
  dietTags:string[]=[];
  availableTags: string[]=['Alcohol-Free',
  'Celery-Free',       'Crustcean-Free',
  'Dairy-Free',        'DASH',
  'Egg-Free',          'Fish-Free',
  'FODMAP-Free',       'Gluten-Free',
  'Immuno-Supportive', 'Keto-Friendly',
  'Kidney-Friendly',   'Kosher',
  'Low-Potassium',               'Low-Sugar',
  'Lupine-Free','Mediterranean'];
  availableTags2:string[]=[
  'Mollusk-Free',      'Mustard-Free',
  'No-oil-added',                'Paleo',
  'Peanut-Free',       'Pescatarian',
  'Pork-Free',         'Red-Meat-Free',
  'Sesame-Free',       'Shellfish-Free',
  'Soy-Free',          'Sugar-Conscious',
  'Sulfite-Free',      'Tree-Nut-Free',
  'Vegan',             'Vegetarian',
  'Wheat-Free']
  availableDietTags=['Balanced',	'High-Fiber',	'High-Protein',	'Low-Carb',	'Low-Fat',	'Low-Sodium'];
  update:boolean=false;
  isLoggedIn:boolean=false;
  constructor(private recipeService: RecipesService, private http: HttpClient,private authService:AuthService,private cookieService:CookieService) { 
  }

  async ngOnInit(): Promise<void> {
    try { const recipes = await this.recipeService.getRecipes();
        this.filteredRecipes=recipes;
    this.isLoggedIn=this.authService.isTokenValid();
    const response:any = await this.http.get('https://localhost:7178/api/SavedRecipes?userId='+this.cookieService.get('user') ).toPromise();
    const savedRecipes = response; // Assuming the response is an array of SavedRecipe
      
    recipes.forEach(recipe => {
        const matchingRecipe = savedRecipes.find((savedRecipe:any) => savedRecipe.url === recipe.url);
         
        if (matchingRecipe) {
            recipe.saved = true;
        } else {
            recipe.saved = false;
        }
    });
    this.filteredRecipes=recipes;
    } catch (error) {
      console.error('Error fetching recipes', error);
    }
  
  }
  
  dropdownActive: boolean = false;

  // Function to toggle the dropdown's visibility
  toggleDropdown() {
    this.dropdownActive = !this.dropdownActive;
    console.log("Dropdown Active: " + this.dropdownActive);
  }
  
  filterRecipesByHealth(health: string): void {
    console.log(this.healthTags);
    const index = this.healthTags.indexOf(health);
    if (index !== -1) {
      this.healthTags.splice(index, 1);
    }
  else if (this.dietTags.includes(health)) {
    // The selected parameter is in dietTags, define your logic here
    // You can add it to healthTags or remove it from dietTags based on your requirements.
    // For example, moving it to healthTags:
    const index = this.dietTags.indexOf(health);
    if (index !== -1) {
      this.dietTags.splice(index, 1);
      this.healthTags.push(health);
    }
  } else if (this.availableDietTags.includes(health)) {
    // The selected parameter is available in dietTags, add it to dietTags
    this.dietTags.push(health);
  } else {
    // The selected parameter is not in any array, add it to healthTags
    this.healthTags.push(health);
  }    if (this.update) {
      this.recipeService.getRecipesByHealth(this.healthTags,this.dietTags,this.searchTerm,this.minCalories,this.maxCalories).subscribe((recipes) => {
        this.filteredRecipes = recipes;
      }, (error) => {
        console.error('Error filtering recipes by type and health', error);
      });
  }
  else{
      this.recipeService.getRecipesByHealth(this.healthTags,this.dietTags,this.searchTerm).subscribe((recipes) => {
        this.filteredRecipes = recipes;
      }, (error) => {
        console.error('Error filtering recipes by type and health', error);
      });
 
  }
  }
  minCalories:number=0;
  maxCalories=500;
  saveToLocalStorage() {
    localStorage.setItem('filteredRecipes', JSON.stringify(this.filteredRecipes));
    localStorage.setItem('healthTags', JSON.stringify(this.healthTags));
    localStorage.setItem('dietTags', JSON.stringify(this.dietTags));
  }
 updateCalories(){
  this.toggleDropdown();
  this.recipeService.getRecipesByHealth(this.healthTags,this.dietTags,this.searchTerm,this.minCalories,this.maxCalories).subscribe((recipes) => {
    this.filteredRecipes = recipes;
  }, (error) => {
    console.error('Error filtering recipes by type and health', error);
  });
 }
  searchTerm: string = '';
  Page:number=1;
  async getRecipes(): Promise<void> {
    try {
      const response = await this.http.get<any>(`https://localhost:7178/GetPage/${this.Page}`).toPromise();
      const hits = response["hits"];
      const rec: { title: string; image: string; description: string; calories: number; dietLabels: string[]; saved: boolean; source: string; url: string; servings: number; time: number, healthLabels: string[] }[] = [];

      hits.forEach((hit: any) => {
        const recipe = hit.recipe;
        const label: string = recipe.label;
        const image: string = recipe.image;
        const source: string = recipe.source;
        const url: string = recipe.url;
        let description: string = Number(recipe.calories).toString() + ", ";

        recipe.dietLabels.forEach((element: string) => {
          description += element + "kcal , ";
        });

        rec.push({ title: label, image: image, description: description, calories: Math.round(recipe.calories / recipe.yield), dietLabels: recipe.dietLabels, saved: false, source: source, url: url, servings: recipe.yield, time: recipe.totalTime, healthLabels: recipe.healthLabels });
      });

      this.filteredRecipes = rec;
    } catch (error) {
      console.error(error);
      this.filteredRecipes = [];
    }
  }

  nextPage(): void {
    this.Page++;
    this.getRecipes();
  }

  prevPage(): void {
    if (this.Page != 1) {
      this.Page--;
      this.getRecipes();
    }
  }

  goToPage(page: number): void {
    this.Page = page;
    this.getRecipes();
  }
  getPages(): number[] {
    const arr: number[] = [];
    // You need to implement a function to calculate the total number of pages

    const startPage = Math.max(1, this.Page - 3);
    const endPage = this.Page + 3;

    for (let i = startPage; i <= endPage; i++) {
        arr.push(i);
    }

    return arr;
}
  async updateItems(): Promise<void> {
    if(this.searchTerm==''){
      this.filteredRecipes=await this.recipeService.getRecipes();
       }
       else{
 this.filteredRecipes=await this.recipeService.getFilteredRecipes(this.searchTerm);
       }
  }
  navigateToSource(url: string): void {
    window.open(url, '_blank');
  }
  saved:boolean=false;
  async toggleSaveRecipe(recipe:{ title: string; image: string; description: string; calories: number; dietLabels:string[];saved:boolean;source:string;url:string;servings:number; time:number }){
recipe.saved=!recipe.saved;

if(recipe.saved==true){
  const response: any = await this.http.post('https://localhost:7178/api/SavedRecipes/', {
    title: recipe.title,
    calories: recipe.calories,
    time: recipe.time,
    servings: recipe.servings,
    dietLabels: recipe.dietLabels.join('/'),
    profileImage: recipe.image,
    url: recipe.url,
    userId: this.cookieService.get('user')
  }).toPromise();
  console.log(response);
}
else{
  const res: any=await this.http.delete('https://localhost:7178/api/SavedRecipes?userId='+this.cookieService.get('user')+'&url='+recipe.url).toPromise();
  console.log(res);
}
  }
  get suggestions() {
    if (this.searchTerm === '') {
      return [];
    }
    return this.filteredRecipes.filter(recipe => recipe.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }
  getStarRatingArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starRatingArray = Array(5).fill(0);

    for (let i = 0; i < fullStars; i++) {
      starRatingArray[i] = 1;
    }

    if (hasHalfStar) {
      starRatingArray[fullStars] = 0.5;
    }
    return starRatingArray;
  }
}
