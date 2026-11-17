from django.test import TestCase
from django.contrib.auth import get_user_model
from items.models import LostItem, FoundItem
from matching.models import MatchRecord, ItemEmbedding
from matching.services import (
    calculate_cosine_similarity,
    calculate_category_similarity,
    calculate_color_similarity,
    calculate_text_similarity,
    haversine_distance_km,
    compute_combined_matching_score,
    run_match_for_lost_item
)
from datetime import date
from PIL import Image
import io
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class MatchingEngineTests(TestCase):
    def setUp(self):
        self.user_lost = User.objects.create_user(username='lostuser', password='Password@123', role='user')
        self.user_finder = User.objects.create_user(username='finderuser', password='Password@123', role='finder')

    def _create_image(self, color=(200, 50, 50)):
        img = Image.new('RGB', (100, 100), color=color)
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        return SimpleUploadedFile('test.jpg', buf.getvalue(), content_type='image/jpeg')

    def test_cosine_similarity_identical_vectors(self):
        vec1 = [0.5, 0.5, 0.5, 0.5]
        score = calculate_cosine_similarity(vec1, vec1)
        self.assertAlmostEqual(score, 100.0, places=1)

    def test_cosine_similarity_orthogonal_vectors(self):
        vec1 = [1.0, 0.0]
        vec2 = [0.0, 1.0]
        score = calculate_cosine_similarity(vec1, vec2)
        self.assertAlmostEqual(score, 0.0, places=1)

    def test_category_and_color_scoring(self):
        self.assertEqual(calculate_category_similarity('laptops', 'laptops'), 100.0)
        self.assertEqual(calculate_category_similarity('laptops', 'phones'), 60.0)
        self.assertEqual(calculate_color_similarity('Black', 'Grey', 'Black', 'Silver'), 100.0)

    def test_haversine_distance(self):
        # Hyderabad coordinates roughly ~1km apart
        dist = haversine_distance_km(17.4435, 78.3772, 17.4440, 78.3778)
        self.assertTrue(dist < 1.0) # Less than 1km

    def test_run_match_generation(self):
        lost = LostItem.objects.create(
            user=self.user_lost,
            title='Lost Black Dell Laptop',
            category='laptops',
            description='Dell XPS 15 inch black laptop',
            primary_color='Black',
            date_lost=date.today(),
            location_name='Tech Park',
            city='Hyderabad',
            image=self._create_image((20, 20, 20))
        )
        found = FoundItem.objects.create(
            finder=self.user_finder,
            title='Found Dell Laptop in Cafe',
            category='laptops',
            description='Black Dell laptop found on chair',
            primary_color='Black',
            date_found=date.today(),
            found_location='Tech Park Cafe',
            city='Hyderabad',
            image=self._create_image((25, 25, 25))
        )
        matches = run_match_for_lost_item(lost)
        self.assertTrue(len(matches) >= 1)
        match = matches[0]
        self.assertTrue(match.combined_score >= 50.0)
        self.assertIn(match.confidence_level, ['high', 'medium'])
