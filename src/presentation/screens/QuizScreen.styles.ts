import { StyleSheet } from 'react-native';
import { AppColors } from '../theme/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.darkBlue, padding: 20 },
  timerTrack: {
    height: 6,
    backgroundColor: AppColors.royalBlue,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 16,
  },
  timerFill: { height: 6, borderRadius: 99 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  questionCount: { color: AppColors.muted, fontSize: 14 },
  timer: { color: AppColors.lightBlue, fontSize: 16, fontWeight: '700' },
  questionWrap: {
    backgroundColor: AppColors.royalBlue,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    padding: 20,
    marginBottom: 24,
    minHeight: 100,
    justifyContent: 'center',
  },
  questionText: { color: AppColors.white, fontSize: 17, lineHeight: 26 },
  optionsWrap: { flex: 1 },
  xpToast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 120,
    color: AppColors.gold,
    fontSize: 22,
    fontWeight: 'bold',
  },
  nextBtn: {
    backgroundColor: AppColors.strongBlue,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnText: { color: AppColors.white, fontSize: 16, fontWeight: '700' },
});
