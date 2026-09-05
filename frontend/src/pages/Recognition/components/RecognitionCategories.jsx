import { Grid } from '@mui/material';
import RecognitionCategoryCard from './RecognitionCategoryCard.jsx';

/** Full-width section of four award category cards (spec section 9). */
const RecognitionCategories = ({ levels, onNavigate }) => (
  <Grid container spacing={2} sx={{ mt: 0.5 }}>
    {levels.map((level) => (
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={level.key}>
        <RecognitionCategoryCard level={level} onNavigate={() => onNavigate?.(level.key)} />
      </Grid>
    ))}
  </Grid>
);

export default RecognitionCategories;