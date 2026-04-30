import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });

    const body = await request.json();
    const { text, options, correctIndex, category, hint } = body;

    // Validation
    if (!text || !options || options.length !== 4 || correctIndex === undefined || !category) {
      return NextResponse.json({ error: 'يرجى ملء جميع الحقول المطلوبة' }, { status: 400 });
    }

    if (correctIndex < 0 || correctIndex > 3) {
      return NextResponse.json({ error: 'إجابة صحيحة غير صالحة' }, { status: 400 });
    }

    // AI Quality Filter
    let qualityScore = 50; // default
    let aiFeedback = '';

    try {
      const zai = await ZAI.create();
      const result = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `أنت خبير في تقييم أسئلة المسابقات الثقافية. قيّم هذه السؤال من 0 إلى 100 بناءً على:
1. دقة المعلومة (25 نقطة)
2. وضوح الصياغة (25 نقطة)
3. مناسبة الخيارات (25 نقطة)
4. القيمة التعليمية (25 نقطة)

أجب فقط بصيغة JSON: {"score": عدد, "feedback": "تعليق مختصر بالعربي"}`
          },
          {
            role: 'user',
            content: `السؤال: ${text}\nالخيارات: ${options.join(' | ')}\nالإجابة الصحيحة: ${options[correctIndex]}\nالتصنيف: ${category}`
          }
        ],
      });

      const aiResponse = result.choices[0]?.message?.content || '';
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        qualityScore = Math.min(100, Math.max(0, parsed.score || 50));
        aiFeedback = parsed.feedback || '';
      }
    } catch (aiError) {
      console.error('AI filter error:', aiError);
      qualityScore = 50;
    }

    // Store the submitted question
    const submittedQuestion = await db.appSetting.create({
      data: {
        key: `user_question_${Date.now()}`,
        value: JSON.stringify({
          userId,
          text,
          options,
          correctIndex,
          category,
          hint: hint || '',
          qualityScore,
          aiFeedback,
          status: qualityScore >= 70 ? 'approved' : 'pending',
          createdAt: new Date().toISOString(),
        }),
      },
    });

    // Award coins for submission
    if (qualityScore >= 70) {
      await db.user.update({
        where: { id: userId },
        data: { coins: { increment: 25 } },
      });
    }

    return NextResponse.json({
      success: true,
      qualityScore,
      aiFeedback,
      status: qualityScore >= 70 ? 'approved' : 'pending',
      coinsEarned: qualityScore >= 70 ? 25 : 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Question submission error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إرسال السؤال' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get approved user-submitted questions
    const settings = await db.appSetting.findMany({
      where: { key: { startsWith: 'user_question_' } },
    });

    const approvedQuestions = settings
      .map(s => JSON.parse(s.value))
      .filter(q => q.status === 'approved')
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);

    return NextResponse.json({ questions: approvedQuestions });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
