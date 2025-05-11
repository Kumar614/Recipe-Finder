document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = '82371f014f8645b0aa4f9d748a09fd03'; // Replace with your Spoonacular API key
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('results');
  const modal = document.getElementById('recipe-modal');
  const closeBtn = modal.querySelector('.close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalImage = document.getElementById('modal-image');
  const modalIngredients = document.getElementById('modal-ingredients');
  const modalInstructions = document.getElementById('modal-instructions');

  // Fetch recipes matching search query
  async function fetchRecipes(query) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=12&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  }

  // Fetch detailed recipe info by id
  async function fetchRecipeDetails(id) {
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  // Render recipe cards in the results container
  function renderRecipes(recipes) {
    resultsContainer.innerHTML = '';
    if (!recipes.length) {
      resultsContainer.innerHTML = `<p class="no-results">No recipes found. Try a different search.</p>`;
      return;
    }
    recipes.forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');
      card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" />
        <div class="recipe-title">${recipe.title}</div>
      `;
      card.addEventListener('click', () => openModal(recipe.id));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(recipe.id);
        }
      });
      resultsContainer.appendChild(card);
    });
  }

  // Open modal with detailed recipe info
  async function openModal(recipeId) {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');
    modalTitle.textContent = 'Loading...';
    modalImage.src = '';
    modalImage.alt = '';
    modalIngredients.innerHTML = '';
    modalInstructions.textContent = '';

    try {
      const details = await fetchRecipeDetails(recipeId);
      modalTitle.textContent = details.title || '';
      modalImage.src = details.image || '';
      modalImage.alt = details.title || 'Recipe image';
      // Ingredients
      modalIngredients.innerHTML = '';
      if (details.extendedIngredients && details.extendedIngredients.length > 0) {
        details.extendedIngredients.forEach(ing => {
          const li = document.createElement('li');
          li.textContent = `${ing.original}`;
          modalIngredients.appendChild(li);
        });
      }
      // Instructions (some API responses may have instructions as HTML)
      modalInstructions.innerHTML = details.instructions || '<p>No instructions available.</p>';
    } catch (error) {
      modalTitle.textContent = 'Error loading recipe details';
      modalInstructions.textContent = '';
      modalIngredients.innerHTML = '';
    }
  }

  // Close modal function
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('show');
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  searchForm.addEventListener('submit', async e => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    resultsContainer.innerHTML = '<p>Loading...</p>';
    try {
      const recipes = await fetchRecipes(query);
      renderRecipes(recipes);
    } catch (error) {
      resultsContainer.innerHTML = `<p class="no-results">Error fetching recipes. Please try again later.</p>`;
    }
  });
});
