import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Divider, PrimaryButton, TopBar } from '../../components';
import { useKakaoAuth, type KakaoAuthResult } from '../../kakaoAuth';
import { styles } from '../../styles';

export function Login({
    onBack,
    onLogin,
    onKakaoLogin,
    onOpenSignUp,
}: {
    onBack: () => void;
    onLogin: (email: string, password: string) => Promise<void>;
    onKakaoLogin: (result: KakaoAuthResult) => Promise<void>;
    onOpenSignUp: () => void;
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { promptKakao, ready: kakaoReady } = useKakaoAuth();

    const submit = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            await onLogin(email.trim(), password);
        } catch (error) {
            setError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitKakao = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            const result = await promptKakao();
            await onKakaoLogin(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : '카카오 로그인에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.screen}>
            <TopBar left="‹" onLeft={onBack} />
            <Text style={styles.brand}>My Streak</Text>
            <Text style={styles.pageTitle}>만나서 반가워요!</Text>
            <Text style={styles.bodyCopy}>이메일로 로그인하고 오늘의 스트릭을 이어가세요.</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="your@example.com"
            />
            <View style={styles.passwordRow}>
                <TextInput
                    style={styles.passwordDots}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="비밀번호"
                />
            </View>
            {error ? <Text style={styles.caption}>{error}</Text> : null}
            <Pressable style={styles.textButton}>
                <Text style={styles.accentText}>비밀번호를 잊으셨나요?</Text>
            </Pressable>
            <PrimaryButton label={isSubmitting ? '처리 중...' : '로그인'} onPress={submit} />
            <Divider label="또는" />
            <Pressable
                style={[styles.socialButton, styles.kakaoButton]}
                onPress={submitKakao}
                disabled={!kakaoReady || isSubmitting}
            >
                <Text style={styles.socialStrong}>카카오로 시작하기</Text>
            </Pressable>
            <Pressable style={[styles.socialButton, styles.appleButton]}>
                <Text style={styles.socialLight}>Apple로 시작하기</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
                <Text style={styles.socialStrong}>G Google로 시작하기</Text>
            </Pressable>
            <Pressable style={styles.textButton} onPress={onOpenSignUp}>
                <Text style={styles.secondaryText}>처음이신가요? 회원가입하기</Text>
            </Pressable>
        </ScrollView>
    );
}
