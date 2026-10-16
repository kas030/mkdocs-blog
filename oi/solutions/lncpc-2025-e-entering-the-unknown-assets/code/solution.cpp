#include <bits/stdc++.h>
using namespace std;

int get_max_dig(int x) {
    int res{};
    while (x) {
        res = max(res, x % 10);
        x /= 10;
    }
    return res;
}

int main() {
    cin.tie(nullptr)->sync_with_stdio(0);

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        vector<int> a(n + 1);
        for (int i = 1; i <= n; i++) {
            cin >> a[i];
        }

        //计算所有数的最大数字
        vector<int> max_dig(n + 1);
        ranges::transform(a, max_dig.begin(), get_max_dig);

        long long ans{};
        //枚举子数组的最大数字
        for (int d = 1; d < 10; d++) {
            //计算模 d 意义下的前缀和
            vector<int> pref_mod(n + 1);
            auto mod_acc = [d](int x, int y) { return (x + y) % d; };
            inclusive_scan(a.begin(), a.end(), pref_mod.begin(), mod_acc);

            //用于计算段内所有和能被 d 整除的子数组总数
            auto seg_count = [](span<int> cnt) {
                long long res{};
                for (long long i : cnt) {
                    res += i * (i - 1) / 2;
                }
                return res;
            };
            //统计段内模 d 前缀和各数字出现数量
            vector<int> cnt(d);
            cnt[0] = 1; //空前缀
            long long leq_d{}; //最大数字小于等于 d 的段内和能被 d 整除的子数组数量
            for (int i = 1; i <= n; i++) {
                if (max_dig[i] <= d) {
                    cnt[pref_mod[i]]++; //位于段内，统计出现数量
                } else {
                    //到达一个段的右边界
                    leq_d += seg_count(cnt); //统计所有和能被 d 整除的子数组数量
                    ranges::fill(cnt, 0); //下一个段 cnt 清零
                    cnt[pref_mod[i]] = 1; //考虑段的左边界，即下一段的空前缀
                }
            }
            leq_d += seg_count(cnt);

            ranges::fill(cnt, 0);
            cnt[0] = 1;
            long long l_d{}; //最大数字小于 d 的段内和能被 d 整除的子数组数量
            for (int i = 1; i <= n; i++) {
                if (max_dig[i] < d) {
                    cnt[pref_mod[i]]++;
                } else {
                    l_d += seg_count(cnt);
                    ranges::fill(cnt, 0);
                    cnt[pref_mod[i]] = 1;
                }
            }
            l_d += seg_count(cnt);

            ans += leq_d - l_d;
        }
        cout << format("{}\n", ans);
    }
    return 0;
}
